(()=>{'use strict';
const $=id=>document.getElementById(id);
const V={
  a:[[800,100,1],[1200,130,.76],[2500,180,.38]],
  i:[[310,80,1],[2250,150,.82],[3000,200,.34]],
  u:[[370,90,1],[950,120,.7],[2200,180,.3]],
  e:[[520,95,1],[1900,140,.78],[2700,190,.34]],
  o:[[520,100,1],[850,120,.76],[2500,180,.3]]
};
const K={'は':['h','a'],'ぴ':['p','i'],'ば':['b','a'],'で':['d','e'],'つ':['t','u'],'ゆ':['y','u'],'る':['r','u']};
const C={
  h:[3400,1400,.055,.07],p:[1900,1000,.095,.055],b:[650,450,.075,.06],
  d:[2500,900,.085,.06],t:[3800,1200,.1,.06],s:[5200,1700,.07,.11],
  y:[2300,900,.045,.055],r:[1700,700,.055,.05]
};
let song=null,audio=null,nodes=[],timers=[],noise=null;

function decode(raw){let normalized=raw;try{if(!raw.includes('|'))normalized=decodeURIComponent(raw)}catch(_){}const p=normalized.split('|');if(p[0]!=='SC2'||p.length!==4)throw Error('このSongCodeは再生できません');const notes=p[3].split('~').map(x=>{const m=/^([^.]+)\.(\d+(?:\.\d+)?)\.(.*)$/.exec(x);if(!m)throw Error('曲データが壊れています');return{p:m[1],d:+m[2],l:decodeURIComponent(m[3])}});if(!notes.length||notes.some(n=>!Number.isFinite(n.d)||n.d<=0))throw Error('曲データが壊れています');const bpm=+p[2];if(!Number.isFinite(bpm)||bpm<30||bpm>300)throw Error('テンポ情報が不正です');return{title:decodeURIComponent(p[1]),bpm,notes}}
function midi(note){const m=/^([A-G])([#B]?)(\d)$/.exec(note),s={C:0,D:2,E:4,F:5,G:7,A:9,B:11};if(!m)throw Error('音程データが不正です');return(+m[3]+1)*12+s[m[1]]+(m[2]==='#'?1:m[2]==='B'?-1:0)}
const hz=n=>440*2**((midi(n)-69)/12);
function ctx(){if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();return audio}
function envelope(param,start,end,peak,attack=.035,release=.075){param.setValueAtTime(.0001,start);param.linearRampToValueAtTime(peak,Math.min(end,start+attack));param.setValueAtTime(peak,Math.max(start+attack,end-release));param.exponentialRampToValueAtTime(.0001,end)}
function noiseBuffer(a){if(noise)return noise;noise=a.createBuffer(1,a.sampleRate*.35,a.sampleRate);const data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;return noise}
function consonant(kind,start,maxDur,f0){const spec=C[kind];if(!spec)return;const a=ctx(),[freq,bw,level,length]=spec,dur=Math.min(maxDur,length),src=a.createBufferSource(),filter=a.createBiquadFilter(),gain=a.createGain();src.buffer=noiseBuffer(a);filter.type='bandpass';filter.frequency.value=freq;filter.Q.value=Math.max(.7,freq/bw);envelope(gain.gain,start,start+dur,level,.008,.018);src.connect(filter).connect(gain).connect(a.destination);src.start(start);src.stop(start+dur+.01);nodes.push(src);if(['b','d','y','r'].includes(kind)){const pulse=a.createOscillator(),pg=a.createGain();pulse.type='triangle';pulse.frequency.value=f0;envelope(pg.gain,start,start+dur,.045,.01,.02);pulse.connect(pg).connect(a.destination);pulse.start(start);pulse.stop(start+dur+.01);nodes.push(pulse)}}
function vowel(note,start,dur,vowelName){const a=ctx(),end=start+dur,f0=hz(note),osc=a.createOscillator(),warm=a.createOscillator(),body=a.createGain(),warmGain=a.createGain(),sum=a.createGain(),master=a.createGain();osc.type='sawtooth';warm.type='triangle';osc.frequency.value=f0;warm.frequency.value=f0;warmGain.gain.value=.14;envelope(body.gain,start,end,.18,.035,.08);osc.connect(body);warm.connect(warmGain).connect(body);for(const [freq,bw,gain] of(V[vowelName]||V.a)){const filter=a.createBiquadFilter(),formantGain=a.createGain();filter.type='bandpass';filter.frequency.value=freq*1.1;filter.Q.value=Math.max(1,freq/bw);formantGain.gain.value=gain*1.35;body.connect(filter).connect(formantGain).connect(sum)}master.gain.value=.82;sum.connect(master).connect(a.destination);osc.start(start);warm.start(start);osc.stop(end+.02);warm.stop(end+.02);nodes.push(osc,warm)}
function segment(note,start,dur,cons,vow){const lead=Math.min(dur*.22,(C[cons]?.[3]||.04));consonant(cons,start,lead,hz(note));vowel(note,start+lead*.52,Math.max(.045,dur-lead*.52),vow)}
function pronunciation(index,label){if([3,9,15,22].includes(index))return[['s','u',.28],['d','e',.72]];if(index===16)return[['d','i',.5],['y','a',.5]];return[[...(K[label]||['h','a']),1]]}
function voice(note,start,dur,label,index){let at=start;for(const [cons,vow,ratio] of pronunciation(index,label)){const part=dur*ratio;segment(note,at,part,cons,vow);at+=part}}
function clearVisuals(){timers.forEach(clearTimeout);timers=[];document.querySelectorAll('[data-note]').forEach(el=>{el.classList.remove('active','sung');el.removeAttribute('aria-current')});$('birdStage').classList.remove('is-singing')}
function highlight(index){document.querySelectorAll('[data-note]').forEach(el=>{const n=+el.dataset.note;el.classList.toggle('active',n===index);el.classList.toggle('sung',n<index);if(n===index)el.setAttribute('aria-current','true');else el.removeAttribute('aria-current')})}
function later(fn,seconds){timers.push(setTimeout(fn,seconds*1000))}
function play(){nodes.forEach(n=>{try{n.stop()}catch(_){}});nodes=[];clearVisuals();const a=ctx(),origin=a.currentTime+.08;let at=origin,elapsed=.08;$('birdStage').classList.add('is-singing');song.notes.forEach((n,index)=>{const sec=60/song.bpm*n.d;if(n.p!=='R')voice(n.p,at,sec*.96,n.l,index);later(()=>highlight(index),elapsed);at+=sec;elapsed+=sec});$('status').textContent='名前入りの歌を再生しています';later(()=>{clearVisuals();document.querySelectorAll('[data-note]').forEach(el=>el.classList.add('sung'));$('status').textContent='再生が終わりました'},elapsed+.15)}
try{song=decode(location.hash.slice(1));$('title').textContent=song.title;$('meta').textContent=`${song.notes.length}音・テンポ${song.bpm}`;const m=/to (.+)$/i.exec(song.title);if(m){const chars=[...m[1]];const nameParts=$('name').querySelectorAll('[data-note]');nameParts.forEach((el,i)=>el.textContent=chars[i]||'');}$('play').disabled=false;$('play').onclick=play;$('status').textContent='再生ボタンを押してください'}catch(e){$('title').textContent='SongCodeを開けませんでした';$('status').textContent=e.message;$('status').classList.add('error')}
})();

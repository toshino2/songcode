(()=>{
'use strict';
const $=id=>document.getElementById(id);
const EXAMPLE='SC2|%E3%81%A1%E3%82%87%E3%81%86%E3%81%A1%E3%82%87|112|C4.1.%E3%81%A1~D4.1.%E3%82%87~E4.2.%E3%81%86~E4.1.%E3%81%A1~D4.1.%E3%82%87~C4.2.%E3%81%86~D4.1.%E3%81%AA~E4.1.%E3%81%AE~F4.1.%E3%81%AF~F4.1.%E3%81%AB~F4.1.%E3%81%A8~E4.1.%E3%81%BE~D4.1.%E3%82%8C~C4.2.%E3%83%BC';
const V={
  a:[[800,100,1],[1200,130,.76],[2500,180,.38]],
  i:[[310,80,1],[2250,150,.82],[3000,200,.34]],
  u:[[370,90,1],[950,120,.7],[2200,180,.3]],
  e:[[520,95,1],[1900,140,.78],[2700,190,.34]],
  o:[[520,100,1],[850,120,.76],[2500,180,.3]]
};
const K={'あ':['','a'],'い':['','i'],'う':['','u'],'え':['','e'],'お':['','o'],'か':['k','a'],'き':['k','i'],'く':['k','u'],'け':['k','e'],'こ':['k','o'],'さ':['s','a'],'し':['s','i'],'す':['s','u'],'せ':['s','e'],'そ':['s','o'],'た':['t','a'],'ち':['t','i'],'つ':['t','u'],'て':['t','e'],'と':['t','o'],'な':['n','a'],'に':['n','i'],'ぬ':['n','u'],'ね':['n','e'],'の':['n','o'],'は':['h','a'],'ひ':['h','i'],'ふ':['h','u'],'へ':['h','e'],'ほ':['h','o'],'ま':['m','a'],'み':['m','i'],'む':['m','u'],'め':['m','e'],'も':['m','o'],'や':['y','a'],'ゆ':['y','u'],'よ':['y','o'],'ら':['r','a'],'り':['r','i'],'る':['r','u'],'れ':['r','e'],'ろ':['r','o'],'わ':['w','a'],'ん':['n','u'],'が':['g','a'],'ぎ':['g','i'],'ぐ':['g','u'],'げ':['g','e'],'ご':['g','o'],'ざ':['z','a'],'じ':['z','i'],'ず':['z','u'],'ぜ':['z','e'],'ぞ':['z','o'],'だ':['d','a'],'ぢ':['d','i'],'づ':['d','u'],'で':['d','e'],'ど':['d','o'],'ば':['b','a'],'び':['b','i'],'ぶ':['b','u'],'べ':['b','e'],'ぼ':['b','o'],'ぱ':['p','a'],'ぴ':['p','i'],'ぷ':['p','u'],'ぺ':['p','e'],'ぽ':['p','o']};
const C={
  h:[3400,1400,.055,.07],p:[1900,1000,.095,.055],b:[650,450,.075,.06],
  d:[2500,900,.085,.06],t:[3800,1200,.1,.06],s:[5200,1700,.07,.11],
  y:[2300,900,.045,.055],r:[1700,700,.055,.05],k:[2500,1000,.07,.06],
  g:[700,500,.06,.06],m:[420,300,.035,.05],n:[1300,700,.04,.05],
  w:[600,500,.035,.05],z:[2900,1500,.05,.06]
};

let audio=null,nodes=[],noise=null;
function midi(note){const m=/^([A-G])([#B]?)(\d)$/.exec(note),s={C:0,D:2,E:4,F:5,G:7,A:9,B:11};if(!m)throw Error('音程データが不正です');return(+m[3]+1)*12+s[m[1]]+(m[2]==='#'?1:m[2]==='B'?-1:0)}
const hz=n=>440*2**((midi(n)-69)/12);
function ctx(){if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();return audio}
function envelope(param,start,end,peak,attack=.035,release=.075){param.setValueAtTime(.0001,start);param.linearRampToValueAtTime(peak,start+Math.min(attack,(end-start)*.3));param.setValueAtTime(peak,Math.max(start+Math.min(attack,(end-start)*.3),end-Math.min(release,(end-start)*.4)));param.exponentialRampToValueAtTime(.0001,end)}
function noiseBuffer(a){if(noise)return noise;noise=a.createBuffer(1,a.sampleRate*.35,a.sampleRate);const data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;return noise}
function consonant(kind,start,maxDur,f0){const spec=C[kind];if(!spec)return;const a=ctx(),[freq,bw,level,length]=spec,dur=Math.min(maxDur,length),src=a.createBufferSource(),filter=a.createBiquadFilter(),gain=a.createGain();src.buffer=noiseBuffer(a);filter.type='bandpass';filter.frequency.value=freq;filter.Q.value=Math.max(.7,freq/bw);envelope(gain.gain,start,start+dur,level,.008,.018);src.connect(filter).connect(gain).connect(a.destination);src.start(start);src.stop(start+dur+.01);nodes.push(src);if(['b','d','y','r'].includes(kind)){const pulse=a.createOscillator(),pg=a.createGain();pulse.type='triangle';pulse.frequency.value=f0;envelope(pg.gain,start,start+dur,.045,.01,.02);pulse.connect(pg).connect(a.destination);pulse.start(start);pulse.stop(start+dur+.01);nodes.push(pulse)}}
function vowel(note,start,dur,vowelName){const a=ctx(),end=start+dur,f0=hz(note),osc=a.createOscillator(),warm=a.createOscillator(),body=a.createGain(),warmGain=a.createGain(),sum=a.createGain(),master=a.createGain();osc.type='sawtooth';warm.type='triangle';osc.frequency.value=f0;warm.frequency.value=f0;warmGain.gain.value=.14;envelope(body.gain,start,end,.18,.035,.08);osc.connect(body);warm.connect(warmGain).connect(body);for(const [freq,bw,gain] of(V[vowelName]||V.a)){const filter=a.createBiquadFilter(),formantGain=a.createGain();filter.type='bandpass';filter.frequency.value=freq*1.1;filter.Q.value=Math.max(1,freq/bw);formantGain.gain.value=gain*1.35;body.connect(filter).connect(formantGain).connect(sum)}master.gain.value=.82;sum.connect(master).connect(a.destination);osc.start(start);warm.start(start);osc.stop(end+.02);warm.stop(end+.02);nodes.push(osc,warm)}
function segment(note,start,dur,cons,vow){const lead=Math.min(dur*.16,(C[cons]?.[3]||.035));consonant(cons,start,lead,hz(note));vowel(note,start+Math.min(.014,lead*.25),Math.max(.045,dur-.01),vow)}

let playing=false,starting=false,run=0,timer=null,lastVowel='a';
const esc=v=>encodeURIComponent(v).replace(/~/g,'%7E');
function parse(raw){
 let text=raw.trim();
 if(/^https?:\/\//i.test(text))text=new URL(text).hash.slice(1);
 text=text.replace(/^#/,'');
 if(!text.includes('|')&&!text.includes(':'))text=decodeURIComponent(text);
 let title='無題の曲',bpm=112,items,colon=false;
 if(text.startsWith('SC2|')){
  const p=text.split('|');if(p.length!==4)throw Error('SC2の区切りを確認してください。');
  title=decodeURIComponent(p[1]);bpm=Number(p[2]);items=p[3].split('~');
 }else{colon=true;items=text.split(/[,\n]+/).filter(x=>x.trim())}
 if(!Number.isFinite(bpm)||bpm<30||bpm>300)throw Error('BPMは30〜300で指定してください。');
 if(!items.length||items.length>2048)throw Error('音符は1〜2048個で入力してください。');
 const notes=items.map((item,i)=>{
  const m=(colon?/^\s*(R|[A-G](?:#|b|B)?\d):(\d+(?:\.\d+)?):([^:]*)\s*$/:/^(R|[A-G](?:#|b|B)?\d)\.(\d+(?:\.\d+)?)\.(.*)$/).exec(item.trim());
  if(!m)throw Error((i+1)+'番目の音符を確認してください。音名:長さ:歌詞 またはSC2形式で入力できます。');
  const p=m[1].replace('b','B'),d=Number(m[2]),l=colon?m[3]:decodeURIComponent(m[3]);
  if(!Number.isFinite(d)||d<=0||d>64)throw Error('音符の長さは0より大きく64以下にしてください。');
  if(p!=='R'&&(midi(p)<12||midi(p)>108))throw Error('音程はC0〜C8の範囲で入力してください。');
  return{p,d,l};
 });
 if(notes.reduce((s,n)=>s+n.d,0)*60/bpm>600)throw Error('曲は10分以内にしてください。');
 return{title,bpm,notes};
}
function voice(note,start,dur,label){
 const chars=[...label.normalize('NFKC').replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96))];
 const units=[];
 for(const ch of chars){
  if('ゃゅょぁぃぅぇぉ'.includes(ch)){
   const v={'ゃ':'a','ゅ':'u','ょ':'o','ぁ':'a','ぃ':'i','ぅ':'u','ぇ':'e','ぉ':'o'}[ch];
   if(units.length)units[units.length-1][1]=v;else units.push(['y',v]);
  }else if(ch==='ー'||ch==='~')units.push(['',units.length?units[units.length-1][1]:lastVowel]);
  else if(ch==='っ')units.push(null);
  else if(K[ch])units.push([...K[ch]]);
  else if(!/\s/.test(ch))units.push(['','a']);
 }
 if(!units.length)units.push(['',lastVowel]);
 units.forEach((unit,i)=>{if(unit){segment(note,start+dur*i/units.length,dur/units.length,...unit);lastVowel=unit[1]}});
}
function status(text,error=false){$('status').textContent=text;$('status').className='status'+(error?' error':'')}
function stop(){
 run++;clearInterval(timer);timer=null;
 nodes.forEach(n=>{try{n.stop()}catch(_){}});nodes=[];
 playing=false;starting=false;$('play').textContent='▶ 再生する';
}
function get(){
 try{const s=parse($('code').value);$('songInfo').hidden=false;
 $('songTitle').textContent=s.title;$('songBpm').textContent='BPM '+s.bpm;
 $('songNotes').textContent=s.notes.length+' 音';
 $('songDuration').textContent='約 '+Math.round(s.notes.reduce((v,n)=>v+n.d,0)*60/s.bpm)+' 秒';
 status('「'+s.title+'」を読み込みました。');return s;
 }catch(e){$('songInfo').hidden=true;status(e.message,true);return null}
}
async function play(){
 if(playing||starting){stop();status('再生を停止しました。');return}
 const song=get();if(!song)return;
 const token=++run;starting=true;$('play').textContent='■ 停止';
 try{
  const a=ctx();await a.resume();if(token!==run)return;
  if(a.state!=='running')throw Error('音声を開始できません。もう一度再生ボタンを押してください。');
  let at=a.currentTime+.08;lastVowel='a';
  song.notes.forEach(n=>{const d=n.d*60/song.bpm;if(n.p!=='R')voice(n.p,at,d*.96,n.l);at+=d});
  starting=false;playing=true;status('「'+song.title+'」を再生しています。');
  timer=setInterval(()=>{if(a.currentTime>=at+.1){stop();status('再生が終わりました。')}},80);
 }catch(e){if(token===run){stop();status('再生できませんでした：'+e.message,true)}}
}
function make(){
 const song=get();if(!song)return;
 const code='SC2|'+esc(song.title)+'|'+song.bpm+'|'+song.notes.map(n=>n.p+'.'+n.d+'.'+esc(n.l)).join('~');
 $('code').value=code;
 const url=location.href.split('#')[0]+'#'+encodeURIComponent(code);
 try{QRCode.toDataURL(url,{width:520,margin:4,errorCorrectionLevel:'M'},(e,data)=>{
 if(e){status('QRコードの容量を超えています。曲を短くしてください。',true);return}
 $('qr').src=data;$('download').href=data;$('qrArea').hidden=false;status('QRコードを作成しました。');
 })}catch(e){status('QRコード生成を開始できませんでした。ページを再読み込みしてください。',true)}
}
$('code').value=location.hash?location.hash.slice(1):'C4:1:ほ,C4:1:し,G4:1:が,G4:1:き,A4:1:ら,A4:1:り,G4:2:ー';
$('example').onclick=()=>{stop();$('code').value='C4:1:ほ,C4:1:し,G4:1:が,G4:1:き,A4:1:ら,A4:1:り,G4:2:ー';$('qrArea').hidden=true;get()};
$('code').oninput=()=>{$('qrArea').hidden=true};
$('play').onclick=play;$('make').onclick=make;
window.addEventListener('pagehide',stop);
get();
})();

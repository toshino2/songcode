(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const base='https://toshino2.github.io/songcode/play/#';
  const melody=[['G4',.5,'は'],['G4',.5,'ぴ'],['A4',1,'ば'],['G4',1,'で'],['C5',1,'つ'],['B4',2,'ゆ'],['G4',.5,'は'],['G4',.5,'ぴ'],['A4',1,'ば'],['G4',1,'で'],['D5',1,'つ'],['C5',2,'ゆ'],['G4',.5,'は'],['G4',.5,'ぴ'],['G5',1,'ば'],['E5',1,'で'],['C5',1,'で'],['B4',1,'は'],['A4',2,'る'],['F5',.5,'は'],['F5',.5,'ぴ'],['E5',1,'ば'],['C5',1,'で'],['D5',1,'つ'],['C5',2,'ゆ']];
  const anniversaryPitches=['C4','D4','E4','G4','A4','G4','E4','D4','C4','E4','G4','A4','G4','E4','D4','C4'];
  const anniversaryBrightPitches=['E4','G4','A4','C5','G4','E4','D4','E4','G4','A4','C5','D5','C5','A4','G4','E4'];
  const esc=v=>encodeURIComponent(v).replace(/~/g,'%7E');
  const isAnniversary=()=>$('occasion').value==='anniversary';
  const normalizeReading=value=>(value||'').trim().normalize('NFKC').replace(/[ァ-ヶ]/g,char=>String.fromCharCode(char.charCodeAt(0)-96)).replace(/[^ぁ-んー]/g,'');
  const KANJI_DIGITS=['','一','二','三','四','五','六','七','八','九'];
  const KANA_DIGITS=['','いち','に','さん','よん','ご','ろく','なな','はち','きゅう'];
  /** 1〜70。カード表記と歌詞用の読みを同じ数値から作る。 */
  function anniversaryNumber(year){
    const n=Math.max(1,Math.min(70,Number.parseInt(year,10)||1));
    if(n===70)return {number:n,label:'70周年',kanji:'七十',reading:'ななじゅう'};
    if(n<10)return {number:n,label:n+'周年',kanji:KANJI_DIGITS[n],reading:KANA_DIGITS[n]};
    const tens=Math.floor(n/10),ones=n%10;
    return {number:n,label:n+'周年',kanji:(tens===1?'十':KANJI_DIGITS[tens]+'十')+(ones?KANJI_DIGITS[ones]:''),reading:(tens===1?'じゅう':KANJI_DIGITS[tens]==='四'?'よんじゅう':KANJI_DIGITS[tens]==='七'?'ななじゅう':KANJI_DIGITS[tens]==='九'?'きゅうじゅう':KANJI_DIGITS[tens]==='六'?'ろくじゅう':KANJI_DIGITS[tens]==='八'?'はちじゅう':KANJI_DIGITS[tens]==='三'?'さんじゅう':KANJI_DIGITS[tens]==='五'?'ごじゅう':'にじゅう')+(ones?KANA_DIGITS[ones]:'')};
  }
  function anniversaryData(){
    const year=anniversaryNumber($('anniversaryYear').value);
    const one={name:$('partnerOne').value.trim()||'あなた',reading:normalizeReading($('partnerOneReading').value)||'あなた'};
    const two={name:$('partnerTwo').value.trim()||'おふたり',reading:normalizeReading($('partnerTwoReading').value)||'おふたり'};
    return {year,one,two,lyrics:`${one.reading}と${two.reading} ふたりのきねんび ${year.reading}しゅうねん おめでとう これからも たくさん わらって すごそうね`};
  }
  function anniversaryCode(){
    const data=anniversaryData();
    const bright=$('song').value==='anniversary-bright';
    const pitches=bright?anniversaryBrightPitches:anniversaryPitches;
    const syllables=[...data.lyrics.replace(/\s/g,'')].filter(char=>char!=='、'&&char!=='。');
    const notes=syllables.map((lyric,index)=>{
      const pitch=pitches[index%pitches.length];
      const duration=index%8===7?1:.5;
      return pitch+'.'+duration+'.'+esc(lyric);
    }).join('~');
    return 'SC2|'+esc(`ふたりの記念日 ${data.year.label}`)+'|'+(bright?'104':'92')+'|'+notes;
  }
  function code(){
    if(isAnniversary())return anniversaryCode();
    const read=$('reading').value.trim()||'あなた';
    const chars=[...read];
    const notes=melody.map((n,i)=>{
      const label=i===17?(chars[0]||'あ'):i===18?(chars[1]||'な'):n[2];
      return n[0]+'.'+n[1]+'.'+esc(label);
    }).join('~');
    return 'SC2|'+esc('Happy Birthday to '+read)+'|96|'+notes;
  }
  const url=()=>base+code().replace(/\|/g,'%7C');
  function qr(){QRCode.toDataURL(url(),{width:480,margin:2,errorCorrectionLevel:'M'},(e,u)=>{if(!e)$('qrPreview').src=u})}
  function update(){
    const anniversary=isAnniversary();
    $('birthdayFields').hidden=anniversary;
    $('anniversaryFields').hidden=!anniversary;
    if(anniversary){
      const data=anniversaryData();
      $('toPreview').textContent='ふたりの記念日';
      $('agePreview').textContent='結婚記念日 '+data.year.label;
      $('messagePreview').textContent=data.one.name+'と'+data.two.name+' ふたりの記念日';
      $('songTitlePreview').textContent='ふたりの記念日 '+data.year.label;
      $('lyricsPreview').textContent=data.year.reading+'しゅうねん おめでとう';
      $('fromPreview').textContent=$('from').value.trim()||'贈り主より';
      qr();
      return;
    }
    const name=$('name').value.trim()||'あなた';
    const age=$('age').value.trim();
    const from=$('from').value.trim()||'贈り主より';
    $('toPreview').textContent=name+'へ';
    $('agePreview').textContent=age?age+'さいのおたんじょうび、おめでとう。':'おたんじょうび、おめでとう。';
    $('messagePreview').textContent=$('message').value;
    $('fromPreview').textContent=from;
    $('songTitlePreview').textContent='Happy Birthday to You';
    $('lyricsPreview').textContent='はっぴー ばーすでー とぅー ゆー';
    qr();
  }
  function photo(file){
    if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{$('photoPreview').src=reader.result;$('photoPreview').classList.add('show');$('photoPlaceholder').style.display='none'};
    reader.readAsDataURL(file);
  }
  for(let year=1;year<=70;year++){
    const option=document.createElement('option');
    option.value=String(year);
    option.textContent=year+'周年';
    if(year===1)option.selected=true;
    $('anniversaryYear').append(option);
  }
  ['occasion','name','reading','age','message','from','song','partnerOne','partnerOneReading','partnerTwo','partnerTwoReading','anniversaryYear'].forEach(id=>$(id).addEventListener('input',update));
  $('occasion').addEventListener('change',()=>{
    if(isAnniversary()&&!$('song').value.startsWith('anniversary'))$('song').value='anniversary-warm';
    if(!isAnniversary()&&$('song').value.startsWith('anniversary'))$('song').value='birthday';
    update();
  });
  $('song').addEventListener('change',()=>{
    if($('song').value.startsWith('anniversary')&&!isAnniversary())$('occasion').value='anniversary';
    if($('song').value==='birthday'&&isAnniversary())$('occasion').value='birthday';
    update();
  });
  $('message').addEventListener('change',update);
  $('photo').addEventListener('change',e=>photo(e.target.files[0]));
  $('listen').addEventListener('click',()=>window.open(url(),'_blank','noopener'));
  $('print').addEventListener('click',()=>window.print());
  update();
})();

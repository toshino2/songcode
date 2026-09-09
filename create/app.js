(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const base='https://toshino2.github.io/songcode/play/#';
  const melody=[['G4',.5,'は'],['G4',.5,'ぴ'],['A4',1,'ば'],['G4',1,'で'],['C5',1,'つ'],['B4',2,'ゆ'],['G4',.5,'は'],['G4',.5,'ぴ'],['A4',1,'ば'],['G4',1,'で'],['D5',1,'つ'],['C5',2,'ゆ'],['G4',.5,'は'],['G4',.5,'ぴ'],['G5',1,'ば'],['E5',1,'で'],['C5',1,'で'],['B4',1,'は'],['A4',2,'る'],['F5',.5,'は'],['F5',.5,'ぴ'],['E5',1,'ば'],['C5',1,'で'],['D5',1,'つ'],['C5',2,'ゆ']];
  const esc=v=>encodeURIComponent(v).replace(/~/g,'%7E');
  function code(){
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
    const name=$('name').value.trim()||'あなた';
    const age=$('age').value.trim();
    const from=$('from').value.trim()||'贈り主より';
    $('toPreview').textContent=name+'へ';
    $('agePreview').textContent=age?age+'さいのおたんじょうび、おめでとう。':'おたんじょうび、おめでとう。';
    $('messagePreview').textContent=$('message').value;
    $('fromPreview').textContent=from;
    qr();
  }
  function photo(file){
    if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{$('photoPreview').src=reader.result;$('photoPreview').classList.add('show');$('photoPlaceholder').style.display='none'};
    reader.readAsDataURL(file);
  }
  ['name','reading','age','message','from'].forEach(id=>$(id).addEventListener('input',update));
  $('message').addEventListener('change',update);
  $('photo').addEventListener('change',e=>photo(e.target.files[0]));
  $('listen').addEventListener('click',()=>window.open(url(),'_blank','noopener'));
  $('print').addEventListener('click',()=>window.print());
  update();
})();

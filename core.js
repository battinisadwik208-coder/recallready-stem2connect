/* RecallReady deterministic review engine. Shared verbatim with index.html. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.RecallCore=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const DAY=86400000, MAX_CARDS=500;
function id(){return typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'c-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);}
function text(value,name,max){if(typeof value!=='string'||!value.trim()||value.trim().length>max)throw new Error(name+' must contain 1–'+max+' characters.');return value.trim();}
function createCard(front,back,now=Date.now()){return {id:id(),front:text(front,'Question',2000),back:text(back,'Answer',8000),createdAt:now,due:now,interval:0,repetitions:0,reviews:0,lastRating:null};}
function validateDeck(input,now=Date.now()){
if(!input||typeof input!=='object'||Array.isArray(input)||input.format!=='recallready'||input.version!==1||!Array.isArray(input.cards))throw new Error('Expected a RecallReady version 1 deck with a cards array.');
if(input.cards.length>MAX_CARDS)throw new Error('A deck may contain at most 500 cards.');
const seen=new Set();return input.cards.map((raw,i)=>{if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Card '+(i+1)+' must be an object.');
const card=createCard(raw.front,raw.back,now);
if(raw.id!==undefined){if(typeof raw.id!=='string'||!raw.id.trim()||raw.id.length>120)throw new Error('Invalid card ID.');card.id=raw.id;}
if(seen.has(card.id))throw new Error('Duplicate card ID: '+card.id);seen.add(card.id);
for(const key of ['createdAt','due'])if(raw[key]!==undefined){if(!Number.isSafeInteger(raw[key])||raw[key]<0||raw[key]>8640000000000000)throw new Error('Invalid '+key+' timestamp.');card[key]=raw[key];}
for(const key of ['interval','repetitions','reviews'])if(raw[key]!==undefined){if(!Number.isFinite(raw[key])||raw[key]<0||raw[key]>1000000||(key!=='interval'&&!Number.isSafeInteger(raw[key])))throw new Error('Invalid '+key+'.');card[key]=raw[key];}
if(raw.lastRating!==undefined){if(![null,'again','hard','good'].includes(raw.lastRating))throw new Error('Invalid lastRating.');card.lastRating=raw.lastRating;}
return card;});}
function schedule(card,rating,now=Date.now()){
if(!['again','hard','good'].includes(rating))throw new Error('Unknown rating.');
const next={...card,reviews:card.reviews+1,lastRating:rating};
if(rating==='again'){next.interval=0;next.repetitions=0;next.due=now+600000;}
else {next.interval=rating==='hard'?Math.min(365,Math.max(1,Math.ceil(card.interval*1.2))):card.repetitions===0?1:card.repetitions===1?3:Math.min(365,Math.max(1,Math.ceil(card.interval*2.3)));next.repetitions=card.repetitions+1;next.due=now+next.interval*DAY;}
return next;}
function queue(cards,mode,now=Date.now()){if(!['due','all'].includes(mode))throw new Error('Unknown practice mode.');return cards.filter(c=>mode==='all'||c.due<=now).slice().sort((a,b)=>a.due-b.due||a.createdAt-b.createdAt).map(c=>c.id);}
function stats(cards,now=Date.now()){return {total:cards.length,due:cards.filter(c=>c.due<=now).length,reviewed:cards.filter(c=>c.reviews>0).length,reviews:cards.reduce((n,c)=>n+c.reviews,0)};}
function deck(cards){return {format:'recallready',version:1,cards};}
function load(storage,key,now=Date.now()){try{const raw=storage.getItem(key);return raw===null?{cards:null,error:null}:{cards:validateDeck(JSON.parse(raw),now),error:null};}catch(error){return {cards:null,error:'Saved deck could not be read: '+error.message};}}
function save(storage,key,cards){try{storage.setItem(key,JSON.stringify(deck(cards)));return null;}catch(error){return 'Your changes are in memory only. Browser storage failed; export a backup before closing. '+error.message;}}
return {DAY,MAX_CARDS,createCard,validateDeck,schedule,queue,stats,deck,load,save};
});

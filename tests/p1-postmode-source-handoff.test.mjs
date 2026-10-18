import test from 'node:test';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {issueC72V2TermsOffer,acceptC72V2Terms,presentC72V2Introduction,selectC72V2Mode} from '../host/c72-public-mode-admission.mjs';
import {planP1PostModeSourceHandoff} from '../host/p1-postmode-source-handoff.mjs';
const H='a'.repeat(40),T=createHash('sha256').update('original terms').digest('hex');
const offer=issueC72V2TermsOffer({sourceHead:H,termsDigest:T});
const accepted=acceptC72V2Terms({offer,humanMessage:'I ACCEPT',termsPresented:true});
const selection=selectC72V2Mode({accepted,orientation:presentC72V2Introduction(accepted),humanMessage:'EDU'});
test('ZIP offered only on genuine post-mode source blocker; not on uncertain state',()=>{
 const absent=planP1PostModeSourceHandoff({selection,sourceAvailable:false});
 assert.equal(absent.action,'REQUEST_SOURCE_ZIP');assert.ok(absent.source_zip_url.endsWith(`/${H}.zip`));
 assert.equal(planP1PostModeSourceHandoff({selection,sourceAvailable:true}).source_zip_url,null);
 assert.equal(planP1PostModeSourceHandoff({selection}).source_zip_url,null);
 assert.equal(planP1PostModeSourceHandoff({selection:{...selection,selected_mode:'EDU',receipt_sha256:'0'.repeat(64)},sourceAvailable:false}).action,'STOP');
});

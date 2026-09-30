import assert from "node:assert/strict";
import test from "node:test";
import { PASSAGES } from "./corpus.ts";
import { acceptModelAnswer, notesForScheme, retrieveGuidance } from "./retrieve.ts";

test("post-matric income question stays on the reviewed 2.50 lakh line", () => {
  const result = retrieveGuidance("What is the Post-Matric income ceiling?", PASSAGES, "en");
  assert.equal(result.mode, "grounded");
  assert.match(result.text, /2\.50 lakh/);
  assert.ok(result.cites.some((cite) => cite.url.includes("tribal.nic.in")));
  assert.doesNotMatch(result.text, /you are eligible/i);
});

test("hindi post-matric question prefers the hindi note", () => {
  const result = retrieveGuidance("पोस्ट मैट्रिक आय सीमा क्या है?", PASSAGES, "hi");
  assert.equal(result.mode, "grounded");
  assert.match(result.text, /2\.50/);
  assert.match(result.text, /सामान्य मार्गदर्शन/);
});

test("top class returns the published 6.00 lakh line and the 265 list", () => {
  const result = retrieveGuidance("Top Class family income and institute list", PASSAGES, "en");
  assert.equal(result.mode, "grounded");
  assert.match(result.text, /6\.00 lakh/);
  assert.match(result.text, /265/);
});

test("fellowship question keeps the 750 figure", () => {
  const result = retrieveGuidance("How many National Fellowship awards are selected each year?", PASSAGES, "en");
  assert.match(result.text, /750/);
  assert.match(result.text, /fellowship/i);
});

test("overseas question keeps the 20 awards split", () => {
  const result = retrieveGuidance("National Overseas Scholarship slots abroad", PASSAGES, "en");
  assert.match(result.text, /20/);
  assert.match(result.text, /17/);
});

test("personal payment status is refused and does not leak a ceiling", () => {
  const result = retrieveGuidance("What is my payment status and DBT credit?", PASSAGES, "en");
  assert.equal(result.mode, "refused");
  assert.equal(result.cites.length, 0);
  assert.doesNotMatch(result.text, /2\.50/);
});

test("an identity number is refused", () => {
  const result = retrieveGuidance("My Aadhaar is 123456789012, am I approved?", PASSAGES, "en");
  assert.equal(result.mode, "refused");
});

test("a general DBT question is answered, not refused", () => {
  const result = retrieveGuidance("What does Direct Benefit Transfer mean on the ministry page?", PASSAGES, "en");
  assert.equal(result.mode, "grounded");
  assert.match(result.text, /PFMS/);
  assert.match(result.text, /cannot see/i);
});

test("unknown questions fall back instead of inventing a rule", () => {
  const result = retrieveGuidance("What is the weather in Raipur tomorrow?", PASSAGES, "en");
  assert.equal(result.mode, "fallback");
  assert.equal(result.cites.length, 0);
});

test("a model answer with a new amount is dropped", () => {
  const used = PASSAGES.filter((item) => item.id === "post-income-en");
  assert.equal(acceptModelAnswer("The ceiling is Rs. 9.00 lakh.", used), null);
  assert.match(acceptModelAnswer("The reviewed page says Rs. 2.50 lakh per annum.", used) ?? "", /2\.50/);
  assert.match(acceptModelAnswer("Class 11 students can read the Post-Matric note.", used) ?? "", /Class 11/);
});

test("scheme notes come from the same store", () => {
  const notes = notesForScheme(PASSAGES, "post-matric", "en");
  assert.ok(notes.length >= 2);
  assert.ok(notes.every((note) => note.scheme === "post-matric" || note.scheme === "all"));
  assert.ok(notes.every((note) => note.lang === "en"));
});

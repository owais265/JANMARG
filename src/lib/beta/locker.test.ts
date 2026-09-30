import assert from "node:assert/strict";
import test from "node:test";
import { incomeFor, portalsFor, stageFor } from "./locker.ts";

test("Asha's NSP file is blocked on an expired income certificate", () => {
  const nsp = portalsFor("asha").find((portal) => portal.id === "nsp");
  assert.equal(nsp?.status, "action");
  assert.match(nsp?.detail ?? "", /expired/i);
  assert.equal(portalsFor("asha").length, 5);
});

test("Dev's mismatch is visible on NSP and DBT", () => {
  const rows = portalsFor("dev");
  assert.equal(rows.find((portal) => portal.id === "nsp")?.status, "action");
  assert.equal(rows.find((portal) => portal.id === "dbt")?.status, "action");
  assert.match(rows[0]?.detail ?? "", /Deb Kumar Munda/);
});

test("study level maps into the readiness stages", () => {
  assert.equal(stageFor("class11"), "CLASS_11_12");
  assert.equal(stageFor("ug"), "UNDERGRADUATE");
  assert.equal(stageFor("overseasMasters"), "OVERSEAS_APPLICANT");
  assert.equal(incomeFor(148000), "1_TO_2_5_LAKH");
});

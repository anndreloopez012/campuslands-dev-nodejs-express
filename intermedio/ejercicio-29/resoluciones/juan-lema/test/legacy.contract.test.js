import { createLegacyApp } from "../src/legacy/app.js";
import { describeMatchesApiContract } from "../test-support/matches-contract.js";

describeMatchesApiContract("API legacy (antes del refactor)", createLegacyApp);

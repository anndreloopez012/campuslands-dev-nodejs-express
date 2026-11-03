import { createApp } from "../src/app.js";
import { describeMatchesApiContract } from "../test-support/matches-contract.js";

describeMatchesApiContract("API refactorizada (despues)", createApp);

const { findRepo } = require("../src/finder");

async function test() {
  console.log("Running tests...");
  
  try {
    const results = await findRepo("javascript");
    if (results && results.length > 0) {
      console.log("✅ findRepo returned results for 'javascript'");
    } else {
      console.log("❌ findRepo returned no results for 'javascript'");
      process.exit(1);
    }

    const noResults = await findRepo("nonexistent-repo-name-1234567890-xyz");
    if (noResults === null || noResults.length === 0) {
      console.log("✅ findRepo handled no results correctly");
    } else {
      console.log("❌ findRepo should have returned no results");
      process.exit(1);
    }

    console.log("All tests passed!");
  } catch (error) {
    console.error("Test failed with error:", error.message);
    process.exit(1);
  }
}

test();

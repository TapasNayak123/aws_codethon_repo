// This file has an intentional syntax error for testing auto-heal
function testFunction() {
    console.log("test"
    // Missing closing parenthesis - will cause pipeline to fail
}

module.exports = testFunction;

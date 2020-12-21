const Algebra = require("algebra.js");

/** TODO:
  * Two-step problems; "If x - 7 = 5, what is the value of x + 4?"
  ** This would be done simply by solving for x in the first equation, then evaluating the second one

  * fix Equations that include "and the difference is" or "and the quotient is" in situations such as "when 5 is decresed by 2 and the difference is doubled, what is the result?"

  * Average/mean; "find the average of 100, 34 and 73"
  ** the equation is just: (100+34+73)/3
  ** most likely, if the input starts with "average of" or the like, it'll search for "and"(to end a list) then split by the commas
**/



/* functions */
function Solve(input){
  input = input.toLowerCase();
  var variable_priority = "NXYZABCDEFGHIJKLMOPQRSTUVW".split(""); // the order in which unnamed variables should be named
  var output = change(input,"?","");
  var toReturnList = {
    input: input,
    interpret: null,
    answer: "unknown"
  }
  var solveBy;
  var variable;
  var splitter; // only used in ratio problems


  /* Square roots like √(25) */
  for(var e = 0; e < output.length; e++){
    if(output[e] == "√" && output[e+1] == "("){
      e++;
      for(var j = e; j < output.length; j++){
        if(output[j] == ")"){

          let squarerooted = Algebra.parse(output.substr(e+1,j-1-e));
          output = output.substr(0, e-1) + Math.sqrt(squarerooted.constants[0].numer/squarerooted.constants[0].denom) + output.substr(j+1);
          
          break;
        }
      }
      break;
    }
  }

  /* Detect if the answer is a variable */
  // had to move this higher up in the function, messed things up when it had a lower priority
  if(output.split(". ").includes("find the number") || output.split("; ").includes("find the number") || output.split(", ").includes("find the number") || output.split(". ").includes("what is the number") || output.split("; ").includes("what is the number") || output.split(", ").includes("what is the number")){
    
    solveBy = "variable";
    output = change(output,[". what is the number.",". what is the number","; what is the number.","; what is the number",", what is the number.",", what is the number","what is the number.","what is the number",". find the number.",". find the number","find the number.","; find the number.","; find the number","find the number.",", find the number."," find the number","find the number.","find the number"],"");
  
  
  }else if(output.startsWith("the ratio of")){
    // This type of equation is solved in this `if` function and nothing external
    // the ratio of x to y in z is number to number, if there were number x, how many y were there
    
    solveBy = "ratio";
    if(output.split(" ").includes(splitter = "in") || output.split(" ").includes(splitter = "was")){ // variables in this if function prevents the need of more ifs later on
      variable = {
        variables: [{},{}] // the ratio variable names and values
      }
      variable["variables"][0][output.split("the ratio of ")[1].split(" to")[0].toString()] = output.split("the ratio of")[1].split(splitter)[1].split("to")[0]
      variable["variables"][1][output.split("the ratio of ")[1].split(" to ")[1].split(" "+splitter)[0]] = output.split("the ratio of")[1].split(splitter)[1].split("to")[1].split(", ")[0] || output.split("the ratio of")[1].split(splitter)[1].split("to")[1].split("; ")[0] || output.split("the ratio of")[1].split(splitter)[1].split("to")[1].split(". ")[0]
      let check = false;

      if(output.split("how many ")[1].split(" ").includes(check = Object.keys(variable["variables"][0])[0]) || output.split("how many ")[1].split(" ").includes(check = Object.keys(variable["variables"][1])[0])){
        if(Object.keys(variable["variables"][0])[0] == check){
          toReturnList.interpret = change(Object.values(variable["variables"][0])[0]+"/"+Object.values(variable["variables"][1])[0]+"="+check.charAt(0)+"/"+output.split("if there were ")[1].split(" ")[0]," ","");
          toReturnList.answer = check+" = "+Algebra.parse(Object.values(variable["variables"][0])[0]+"/"+Object.values(variable["variables"][1])[0]+"="+check.charAt(0)+"/"+output.split("if there were ")[1].split(" ")[0]).solveFor(check.charAt(0));
        }else{
          toReturnList.interpret = change(Object.values(variable["variables"][1])[0]+"/"+Object.values(variable["variables"][0])[0]+"="+check.charAt(0)+"/"+output.split("if there were ")[1].split(" ")[0]," ","");
          toReturnList.answer = check+" = "+Algebra.parse(Object.values(variable["variables"][1])[0]+"/"+Object.values(variable["variables"][0])[0]+"="+check.charAt(0)+"/"+output.split("if there were ")[1].split(" ")[0]).solveFor(check.charAt(0));
        }
      }else{
        toReturnList.answer = output.split("how many ")[1].split(" ")[0]+" was not included in the equation"; 
      }
    }

    return toReturnList;

  }else if(output.startsWith("evaluate")){
    //evaluate [equation] if X is number and E is number

    solveBy = "eval";
    variable = {
      variables: []
    }

    output = change(output,["equals","the result is","answers","is"],"=");
    output = change(output," ","");

    let temp,tempOutput;
    if(output.split("evaluate")[1].split(temp = "if")[1].includes("and") || output.split("evaluate")[1].split(temp = "when")[1].includes("and")){
      tempOutput = output.split("evaluate")[1].split(temp)[0]
      for(var e = 0; e < output.split("evaluate")[1].split(temp)[1].split("and").length; e++){
        variable.variables[e] = {};
        variable.variables[e][output.split("evaluate")[1].split(temp)[1].split("and")[e].split("=")[0]] = Number(output.split("evaluate")[1].split(temp)[1].split("and")[e].split("=")[1]);
      }
    }else if(output.split("evaluate")[1].split(temp = "if")[1] || output.split("evaluate")[1].split(temp = "when")[1]){
      tempOutput = output.split("evaluate")[1].split(temp)[0];
      variable.variables[0] = {};
      variable.variables[0][output.split("evaluate")[1].split(temp)[1].split("and")[0].split("=")[0]] = Number(output.split("evaluate")[1].split(temp)[1].split("and")[0].split("=")[1]);
    }

    output = tempOutput;
  }else if(output.startsWith("if f(") || output.startsWith("f(")){
    var variables = output.split("f(")[1].split(")")[0].replace(/ /g,"").split(",");
    
    output = change(output.split("=")[1].split(",")[0],variables,output.split("f(")[2].split(")")[0].replace(/ /g,"").split(","));
    output = output.split(",")[0].split(";")[0].split("then")[0].split("when")[0].split("what is")[0]; // just covers all basis, if not "... x+2, ..." it'll get "... x+2; ..." then "... x+2 then what is ..." and finally "... x+2 what is ..."
    output = change(output," ","");
    toReturnList.interpret = output;

    if(Algebra.parse(output).constants[0] == undefined){
      toReturnList.answer = 0;
    }else if(Algebra.parse(output).constants[0].denom == 1){
      toReturnList.answer = Algebra.parse(output).constants[0].numer;
    }else{
      toReturnList.answer = Algebra.parse(output).constants[0].numer+"/"+Algebra.parse(output).constants[0].denom;
    }
    
    return toReturnList;
  }

  output = change(output,["percent","%"],"*0.01");

  if(output.startsWith("solve for")){
    solveBy = "variable";
    variable = output[10];
    output = output.substr(14)
  }


  /* Decides how the function will solve the equation at the end */
  for(var e = 0; e < output.split("a number").length; e++){
    output = output.replace("a number",variable_priority[e]); // only want to change the first accuorance
    output = change(output,"the number",variable_priority[e]); // ^likewise
    if(solveBy == "variable"){
      variable = variable_priority[e];
    }
    output = change(output,"it's",variable_priority[e]);
  }

  let of_and = output.split(" ").indexOf("the");
  if(of_and > -1 && output.split(" ")[of_and+2] == "of" && ["sum","product","difference","quotient"].includes(output.split(" ")[of_and+1])){
    let operation;
    let synonyms = {
      "sum": "+",
      "difference": "_",
      "product": "*",
      "quotient": "/"
    }
    operation = synonyms[output.split(" ")[of_and+1]];
    let thisLongThing = output.split("the "+output.split(" ")[of_and+1]+" of")[1].split(" ");
    thisLongThing[thisLongThing.indexOf("and")+1] += ")";
    thisLongThing[thisLongThing.indexOf("and")] = operation;
    output = output.split("the "+output.split(" ")[of_and+1]+" of")[0]+"("+change(thisLongThing.toString(),","," ");
  }

  let powered = output.split(" ").indexOf("to");
  if(powered > -1 && output.split(" ")[powered+1] == "the" && output.split(" ")[powered+3] == "power"){
    let operation;
    
    output = change(output.split("to the ")[0]+"^"+output.split("to the ")[1].split("power")[0],["st","nd","rd","th"],"");
     
  }

  /* Converts words to operations and numbers */
  output = change(output, ["greater than","increased by"],"+");
  output = change(output, ["to the power of","**"],"^")
  output = change(output, "twice","2 * ");
  output = change(output, ["is doubled","doubled"],"*2"); // different order
  output = change(output, ["plus"],"+");
  output = change(output, ["minus","less than","is decreased by","is reduced by","the opposite of","the opposite"],"-");
  output = change(output, ["times","of","multiplied by"],"*");
  output = change(output, ["divided by","over","÷"],"/");
  output = change(output, ["result of",","],"");
  output = change(output, ["equals","the result is","answers","is"],"=");

  /* Handles situations like "is multiplied by 2" */
  for(var e = 0; e < output.length; e++){
    if(output[e] == "="){ // searches for an equals sign
      if(output[e+1] == "*" || output[e+1] == "/" || output[e+1] == "+" || output[e+1] == "-"){ // this is a check so it only finds the words "is [operation]" instead of EVERY equals sign
        for(var j = e-1; j > -1; j-=1){ // go backwards until finding another equals sign(one half or side of the equation) or the beginning of the equation
          if(output[j] == "=" || j <= 0){
            output = output.substr(0, e) +")"+ output.substr(e+1);  // closes off the paranthesis, errors go brr
            output = output.substr(0, j-1) +"("+ output.substr(j);
            break;
          }
        }
        break;
      }
    }
  }

  output = change(output,[" ","if","what is","the"],"");

  
  for(var i = 0; i < output.length; i++){
    if(variable_priority.includes(output[i])){
      solveBy = "variable";
      variable = variable_priority[0];
      break;
    }
  }

  toReturnList.interpret = output; // this is the interpretation; right here is the final step before finding the answer, where the input is converted to an equation.

  /* Answers */
  
  if(solveBy === "variable"){

    toReturnList.answer = variable+" = "+Algebra.parse(output).solveFor(variable);

  }else if(solveBy === "eval"){

    var expression = Algebra.parse(output);
    for(var e = 0; e < variable.variables.length; e++){
      expression = Algebra.parse(expression.toString()).eval(variable.variables[e]);  
    }

    // same as the thing below
    if(expression.constants[0] == undefined){
      toReturnList.answer = 0;
    }else if(expression.constants[0].denom == 1){
      toReturnList.answer = expression.constants[0].numer;
    }else{
      toReturnList.answer = expression.constants[0].numer+"/"+expression.constants[0].denom;
    }

  }else{

    if(Algebra.parse(output).constants[0] == undefined){
      toReturnList.answer = 0;
    }else if(Algebra.parse(output).constants[0].denom == 1){
      toReturnList.answer = Algebra.parse(output).constants[0].numer;
    }else{
      toReturnList.answer = Algebra.parse(output).constants[0].numer+"/"+Algebra.parse(output).constants[0].denom;
    }

  }

  return toReturnList;
}



function change(input,find,changeto){
  if(typeof find == "string"){
    if(typeof changeto == "string"){
      for(var y = 0; y < input.length; y++){
        input = input.replace(find,changeto);
      }
    }
  }else if(typeof find == "object"){
    if(typeof changeto == "string"){
      for(var x = 0; x < find.length; x++){
        for(var y = 0; y < input.length+1; y++){
          input = input.replace(find[x],changeto);
        }
      }
    }else if(typeof changeto == "object"){
      for(var x = 0; x < find.length; x++){
        if(x > changeto.length) return input;

        for(var y = 0; y < input.length+1; y++){
          input = input.replace(find[x],changeto[x]);
        }
      }
    }
  }
  return input;

  
}
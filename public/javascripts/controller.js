/*global
  $                     :false
  ConcreteContentAssist :false
  clannParser           :false
  jsDump                :false
  TextViewer            :false
  ContentAssistProcessor:false
  ContentAssist         :false
*/

$(document).ready(function() {
   function parseResult() {
        parsing = true;
        var previous = contextParserConfig;
        contextParserConfig = {laxParsing: false, failOnCursor: true};
        try {
            var resultTree = clannParser.parse($("#editor").val());
            $("#result-tree").text(jsDump.parse(resultTree));
            $("#message").text("Text parsed succesfully.");
            $("#message").removeClass("alert-error").addClass("alert-success");
        } catch (e) {
            $("#message").text(buildErrorMessage(e));
            $("#message").removeClass("alert-success").addClass("alert-error");
        }
        contextParserConfig = previous;
        setTimeout(function(){
          if (!parsing) {
            parseResult();
          }
        }, 1000);
        parsing = false;
    }
    
    function buildErrorMessage(e) {
      return (e.line !== undefined && e.column !== undefined)?
        "Line " + e.line + ", column " + e.column + ": " + e.message
        : e.message;
    }
    
    var parsing = false,
        contextParserConfig,
        textarea = document.getElementById('editor'),
        viewer = new TextViewer(textarea),
        processor = new ContentAssistProcessor(),
        content_assist = new ContentAssist(viewer, processor);

    parseResult();
});
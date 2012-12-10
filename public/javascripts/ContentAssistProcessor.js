/*global clannParser:false CompletionProposal:false $:false contextParserConfig:false*/
/**
 * A content assist processor proposes completions and computes context
 * information for a particular character offset. This interface is similar to
 * Eclipse's IContentAssistProcessor
 * @class
 * @author Marcin Stefaniuk
 * @link http://eutechne.stefaniuk.info
 *
 * @include "TextViewer.js"
 * @include "CompletitionProposal.js"
 */
function ContentAssistProcessor() {
}

ContentAssistProcessor.prototype = {
  /**
   * @param {TextViewer} viewer The viewer whose document is used to compute
   * the proposals
   * @param {Number} offset An offset within the document for which
   * completions should be computed
   *
   * @return {CompletitionProposal[]}
   */
  computeCompletionProposals: function(viewer, offset) {
    
    var text = viewer.getContent();
    var proposals = [];
    
    // proposals = [
    //   this.completitionProposalFactory('howdy', offset, 5, 0),
    //   this.completitionProposalFactory('talib', offset, 5, 0),
    //   this.completitionProposalFactory('p[oas', offset, 5, 0),
    //   this.completitionProposalFactory('adkle', offset, 5, 0),
    //   this.completitionProposalFactory('hunks', offset, 5, 0)
    // ];
    var cursoredText = text.substring(0,offset)+"#"+text.substring(offset);
    
    contextParserConfig = {
      laxParsing: true,
      failOnCursor: false
    };
    try {
      // lax parsing of cursored text to get a entities and text before cursor
      var laxTree = clannParser.parse(cursoredText);
      var cursor = laxTree[laxTree.length-1]._cursor;
      // This retrieves the pre-text from the active word upto the cursor
      // for example in 'black cr#ow', we get 'cr' to be used for content assist

      // also laxTree contains all the entities in the text till the cursor
      
      try {
        // lax parsing failing on cursor to receive literal suggestions from parser
        contextParserConfig = {laxParsing: false, failOnCursor: true};
        clannParser.parse(cursoredText);
      } catch (e) {
        var failuresExpected = e.expectations.sort();
        if (failuresExpected.length > 0 && e.position === offset - cursor.length) {
          // error fits cursor position and suggest something
          
          var lastS = null;
          var includeEntityNames = false;
          var proposal;
          
          for (i = 0; i < failuresExpected.length; i++) {
            var s = failuresExpected[i];
            if (s.match(/^".+"$/) && lastS!==s && s.length > 3) {
              // literal suggestion with length more than one char
              text = s.replace(/"/g, '');
              if (text === '' || text.indexOf(cursor)=== 0) {
                proposal =
                  this.completitionProposalFactory( text,
                                    offset - cursor.length,
                                    cursor.length,
                                    offset - cursor.length + text.length);
                proposals.push(proposal);
              }
            } else if (s === 'EntityName') {
              includeEntityNames = true;
            }
            lastS = s;
          }
          
          if (includeEntityNames) {
            for (var j=0; j<laxTree.length-1; j++) {
              text = laxTree[j].name;
              if (laxTree[j]._class === 'Class' && (text === '' || text.indexOf(cursor) === 0)) {
                proposal =
                  this.completitionProposalFactory( text,
                                    offset - cursor.length,
                                    cursor.length,
                                    offset - cursor.length + text.length);
                proposals.push(proposal);
              }
            }
          }
        } else {
          console.log('error');
          // error appears earlier in text so only message is shown
          // $("#message").text(this.buildErrorMessage(e));
        }
      }
    } catch (seriousError) {
      seriousError.message = 'Cursor!! ' + seriousError.message;
      $("#message").text(this.buildErrorMessage(seriousError));
    }

    return proposals.length >0 ? proposals : null;
  },

  computeSuggestions: function(viewer, offset) {
    
    var text = viewer.getContent(),
      proposals = [];
    
    var cursoredText = text.substring(0,offset)+"#"+text.substring(offset),
      textTillCursor = text.substring(0,offset);
    
    contextParserConfig = {
      laxParsing: true,
      failOnCursor: false
    };
    try {
      // lax parsing of cursored text to get a entities and text before cursor
      var laxTree = clannParser.parse(text),
        cursors = cursoredText.match(/\b\w+(?=#)/),
        cursor = "", proposal,
        includeClassNames = false,
        includeEntityNames = false, i;
      if(cursors && cursors.length > 0){
        cursor = cursors[0];
      }
      // This retrieves the pre-text from the active word upto the cursor
      // for example in 'black cr#ow', we get 'cr' to be used for content assist

      // also laxTree contains all the entities in the text till the cursor
      
      try {
        // lax parsing failing on cursor to receive literal suggestions from parser
        contextParserConfig = {laxParsing: false};
        clannParser.parse(textTillCursor);
      } catch (e) {
        var failuresExpected = e.expected.sort();
        if (failuresExpected.length > 0) {
        // if (failuresExpected.length > 0 && e.position === offset - cursor.length) {
          // error fits cursor position and suggest something
          
          var lastS = null,
            text;
          
          for (i = 0; i < failuresExpected.length; i++) {
            var s = failuresExpected[i];
            if (s.match(/^".+"$/) && lastS!==s && s.length > 3) {
              // literal suggestion with length more than one char
              text = s.replace(/"/g, '');
              if (text === '' || text.indexOf(cursor)=== 0) {
                proposal =
                  this.completitionProposalFactory( text,
                                    offset - cursor.length,
                                    cursor.length,
                                    offset - cursor.length + text.length);
                proposals.push(proposal);
              }
            } else if (s === 'Instance') {
              includeEntityNames = true;
            } else if (s === 'Class') {
              includeClassNames = true;
            }
            lastS = s;
          }

        } else {
          console.log('error');
          // error appears earlier in text so only message is shown
          // $("#message").text(this.buildErrorMessage(e));
        }
      }

      if(cursoredText.match(/\.\n?#/)) {
        includeEntityNames = true;
      }


      if (includeEntityNames) {
        for (i = laxTree.objects.length - 1; i >= 0; i--) {
          text = laxTree.objects[i],
            proposal = this.completitionProposalFactory(
              text,
              offset - cursor.length,
              cursor.length,
              offset - cursor.length + text.length);
          proposals.push(proposal);
        }
      }
      
      if (includeClassNames) {
        for (i = laxTree.classes.length - 1; i >= 0; i--) {
          text = laxTree.classes[i],
            proposal = this.completitionProposalFactory(
              text,
              offset - cursor.length,
              cursor.length,
              offset - cursor.length + text.length);
          proposals.push(proposal);
        }
      }

    } catch (seriousError) {
      seriousError.message = 'Cursor!! ' + seriousError.message;
      console.log(seriousError.message);
      $("#message").text(this.buildErrorMessage(seriousError));
    }
    return proposals.length >0 ? proposals : null;
  },
  
  /**
   * @param {String} str The actual string to be inserted into the document
   * @param {Number} offset The offset of the text to be replaced
   * @param {Number} length The length of the text to be replaced
   * @param {Number} cursor The position of the cursor following the insert
   * @return {CompletionProposal}
   */
  completitionProposalFactory: function(str, offset, length, cursor) {
    return new CompletionProposal(str, offset, length, cursor);
  },
  
  buildErrorMessage:  function (e) {
      return (e.line !== undefined && e.column !== undefined) ?
        "Line " + e.line + ", column " + e.column + ": " + e.message
        : e.message;
  }
};
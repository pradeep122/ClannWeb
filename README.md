Parser implementation details

 Two modes of parsing integrated into the parser grammar, 
  - Lax Parsing : for finding entities and other phrases in the text which are used for auto-suggestion lists 
  - Normal parsing :  for parsing the text and building up a parse tree object incrementally, with additional data added at each level, to assentially find relations between the entitites and generate RDF representation of the content of the text
 
 Cursor parsing, which fails upon detecting a cursor, can be used to fetch the substring of the word till the cursor, this substring will be used for populating the auto-suggestions

Arriving at auto-suggestions
Context is needed to derive a list of auto-suggestions. Two kinds of auto suggestions exist
 - Context as a previous word but no word-prefix given
    When a previous word/phrase is given, we can associate the class of the previous word to a class that should come next and derive a list of auto-suggestions 
 - Context as word-prefix  and a previous word
    We use the list derived above to 
 - no Context (start of a sentence)
    When no context is given the drop down should contain a list of Entities, Proper names, that appear in the text above
 - Context from errors
    Parser errors return a list of expected values at the point of failure of the parse. If the grammar rules assign literals to the rules appropriately, this features can be used to populate the expectation values with a list of custom values.Then, failOnCursor parsing can be used to make the parser fail and return errors,  and use the error expectations to make a list of auto-suggestions

Lax parsing
  The lax part of the grammar is used to allow the parsing to fail gracefully while extracting important information from the incorrect parse. In the context of clann grammar, lax parser should be able to extract as many available entities and phrases from an incomplete sentence as possible, This would help primarily with the auto-suggestions
  
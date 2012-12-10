/*global */
{
  var laxParsing = (typeof contextParserConfig === 'undefined' ? true: contextParserConfig.laxParsing);
  var failOnCursor = (typeof contextParserConfig === 'undefined' ? false: contextParserConfig.failOnCursor);
  
  var cursor,
    data = {};
}


start 
  = Definition

Definition 
  = s:Sentences {
    data.statements = s;
    return data;
  }

Sentences 
  = (_ s:Sentence _ {return s})+ / (_ s:LaxSentence _ {return s})+

Sentence 
  = pp:PP vp:VP np:NP "."
    {
      var statement = {
        subject : pp,
        object : np,
        relation : vp,
        errors : 'none'
      };

      return statement;
    }

PP
  = Instance

VP
  = Infinitive / PastTense 

NP 
 = obj:PredicateObject mods:(PredicateModifier)*
  {
    if(!obj.modifiers) obj.modifiers = [];
    for (var i = mods.length - 1; i >= 0; i--) {
      obj.modifiers.push(mods[i]);
    }
    return obj;
  }

Infinitive
  = __ prep:prep __ verb:presentVerb
    {
      return verb;
    }

PastTense
  = __ verb:pastVerb
    {
      return verb;
    }

PredicateObject 
  = (__ determiner)? adjs:(__ adjective )* __ obj:Instance
    {
      if(!obj.modifiers) obj.modifiers = [];
      for (var i = adjs.length - 1; i >= 0; i--) {
        var adj = adjs[i];
        if(adj.type){
          obj.modifiers.push(adj);
        }
      }
      return obj;
    }

PredicateModifier
  = TimeModifier / LocationModifier / CollaborationModifier

TimeModifier
  = __ "by"__ tt:timeNoun
    {
      var result = {
        type : 'endtime',
        value : tt
      };
      if(!data.times) data.times = [];
      data.times.push(tt);
      return result;
    }

LocationModifier
  = __ ("at" / "in") __ ll:locationNoun
    { 
      var result = {
        type : 'location',
        value : ll
      };
      if(!data.locations) data.locations = [];
      data.locations.push(ll);

      return result;
    }


CollaborationModifier
  = __ "with" __ nn:collaborationNoun
    {
      var result = {
        type : 'collaboration',
        value : nn
      };
      return result;
    }


LaxSentence
  = &{return laxParsing} pp:PP vp:LaxVP np:LaxNP
  {
    var statement = {
      subject : pp,
      object : np,
      relation : vp,
      errors : 'incomplete'
    };

    return statement;
  }

LaxVP
  = LaxInfinitive / LaxPastTense

LaxNP 
 = obj:LaxPredicateObject mods:(LaxPredicateModifier)*
  {
    if(!obj.modifiers) obj.modifiers = [];
    for (var i = mods.length - 1; i >= 0; i--) {
      obj.modifiers.push(mods[i]);
    }
    return obj;
  }

LaxInfinitive
  = __ prep __ verb:(presentVerb / anyWord)
    {
      return verb;
    }

LaxPastTense
  = __ verb:pastVerb
    {
      return verb;
    }

LaxPredicateObject 
  = (__ determiner)?  adjs:(__ adjective )* __ obj:Instance
    {
      if(!obj.modifiers) obj.modifiers = [];
      for (var i = adjs.length - 1; i >= 0; i--) {
        var adj = adjs[i];
        if(adj.type){
          obj.modifiers.push(adj);
        }
      }
      return obj;
    }

LaxPredicateModifier
  = LaxTimeModifier / LaxLocationModifier / LaxCollaborationModifier

LaxTimeModifier
  = __ "by"__ (tt:timeNoun / anyWord)
  {
    var result = {
      type : 'endtime',
      value : tt
    };
    if(!data.times) data.times = [];
    data.times.push(tt);
    return result;
  }


LaxLocationModifier
  = __ ("at" / "in") __ (ll:locationNoun / anyWord) 
  { 
    var result = {
      type : 'location',
      value : ll
    };
    if(!data.locations) data.locations = [];
    data.locations.push(ll);

    return result;
  }

LaxCollaborationModifier
  = __ "with" __ (nn:collaborationNoun / anyWord)
  {
    var result = {
      type : 'collaboration',
      value : nn
    };
    return result;
  }

timeNoun
 = "this weekend" / "tomorow" / "next week" / "next month" / "next year"

locationNoun
  = "Crete, Greece"/ "ISWC"/ Instance

collaborationNoun
  = Instance

prep
 = "to" / "by" / "will" / "on" 

presentVerb
 = "complete" / "attend" / "travel"

pastVerb
 = "completed" / "went to" / "developed"

determiner
 = "a" / "an" / "the"

adjective
 = adj:("next" / "technical" / "his")
  {
    return {
      type : 'adjective',
      text : adj
    };
  }





Instance "Instance"
  = _ objname:QName snips:(Snippet)*
    { 

      if(!data.objects) data.objects = [];

      data.objects.push(objname);
      var result = {
        text : objname
      };
      if(snips) result.snippets = snips;
      return result;
    }

Snippet "Snippet"
  = snip:instanceSnippet
    {
      return {
        type : 'instance',
        text : snip
      };
    } /
   snip:classSnippet
    {
      return {
        type : 'class',
        text : snip
      };
    }

instanceSnippet "Snippet for Instances"
  = lb _ "same as" __ obj:ObjectName _ rb
  { 
    if(!data.objects) data.objects = [];
    data.objects.push(obj);
    return obj;
  } 

classSnippet "Snippet for Classes"
  = lb _ ("is a" / "is an" ) __ cls:ClassName _ rb 
    { 
      if(!data.classes) data.classes = [];
      data.classes.push(cls);
      return cls;
    }

ObjectName "Instance"= QName
ClassName "Class"= QName

QName "QName" = name / Name / LongName
LongName = "'" Name (__ Name)+ "'" / '"' f:Name s:(__ t:Name {return " "+t})+ '"' {return f+s.join('')}
Name "Name" = c:[A-Z] d:[A-Za-z0-9]* {return c+d.join('')}
name "name" = c:[a-z] d:[A-Za-z0-9]* {return c+d.join('')}
letters "letters" = d:[A-Za-z0-9]* {return d.join('')}
anyWords = (anyWord)+
anyWord = !("." / __ / "#")
_ "WS" = [ \n\r]*
__ "WS" = [ \n\r]+
lb "[" = _ "[" 
rb "]"= "]"
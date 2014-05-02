(ns language.core
	(:require [clojure.string]
			  [clojure.math.numeric-tower :as math]
			  [lamina.core :refer :all]
			  [aleph.http :refer :all]
			  [ring.middleware.params :refer :all])
  (:gen-class))

(defn -main
  "Language functionality."
  [& args]
  ;(println "Hello, World!")
  
  ;to run this, start command, go to c:\language and type lein repl, then when the repl starts type (-main)

;GENERAL ALL-PURPOSE LANGUAGE MACHINERY
  
  ;creates a vector called DictVector which has each line in cmudict separately
  (println "slurping dict.txt...")
  (def DictVector 
	(clojure.string/split
	  (clojure.string/replace							;replace all the 2s with 0s --OPTIONAL
	    (slurp "resources/dict.txt")
	  #"2" "0")
	#"\n"
	)
  )
  
  	;This function takes an index number for DictVector and outputs the emphases on the syllables
	;of that word
	(defn Emphases [x] 
	  (re-seq #"[0-2]" 
	    (nth 							;take the second half, not 0 but 1 in the split's output vector
		  (clojure.string/split 		;split it into two halves a "  "
		    (nth DictVector x)
		  #"  ")
		1)
	  )
	)
	
	;returns the way a word is spelled from the DictVector index
	(defn Spelling [x]
	  (nth
	    (clojure.string/split
		  (nth DictVector x)
		#"  ")
	  0)
	)
	
	;alternate spelling function that also returns the index of the word, for use in FindWordIndex
	(defn SpellingA [x]
		[(nth
			(clojure.string/split
				(nth DictVector x)
			#"  ")
		0) x]
	)
	
	;returns the way a word is pronounced from the DictVector index
	(defn Pronunciation [x]
	  (nth
	    (clojure.string/split
		  (nth DictVector x)
		#"  ")
	  1)
	)
	
;to get the rhyme, I have to get everything from pronunciation that is
;  to the right of
;   two characters to the left of
;    the character 1 which has no other 1s to its right			ie last emphasized syllable
	(defn Rhyme [x]
	  (re-seq #"\w\w1[^1]*$" (Pronunciation x))
	)

	;input an index number, outputs a vector like [:rhyme index]
	(defn IndexToRhymeKeyword [x]
		[
			(keyword (first
				(Rhyme x)
			))
		x]
	)
	
	;input an index number from DictVector, outputs a vector like [:emphases index]
	(defn IndexToEmphasesKeyword [x]
		[
			(keyword 									;converts string into keywords
				(clojure.string/join (Emphases x))		;concatenates vector, outputs string
			)
		x]
	)

	;input an index number, outputs a map like {:spelling index}
	(defn IndexToSpelling [x]
		{
			(keyword
				(Spelling x)
			)
		x}
	)
	
  ;makes a list containing all the indeces for DictVector, so they can be doseqed through
  (def EveryIndex (range (count DictVector)))
  
	(def BigListEmphToIndex
		(map IndexToEmphasesKeyword EveryIndex)			;BIG list of [:emphases wordindex]
	)
	
	(def BigListRhymeToIndex
		(map IndexToRhymeKeyword EveryIndex)			;big list of [:rhyme wordindex]
	)
	
	;hash-map with unique words as keys and pronunciation numbers as values, like {:GHOST 47165, etc}
	(println "Making dictionary hash map...")
	(def SpellingToIndex
		(reduce merge (map IndexToSpelling EveryIndex))
	)

	
  ;get all the unique :emphases keys
  ;for each one, make a list of all the indexes that go with that emph
  
	;This uses map to run the 'first' function on each element of BLETI.  'first' returns
	;the 0th element of a vector.  Then it uses distinct to get rid of duplicates.
  (def EachEmph
	(distinct (map first BigListEmphToIndex))
  )
  
;create a function where you pass it in an :Emph keyword
;and it spits out a list of indexes that go with it that keyword

(defn EtoI [Ekeyword] 
	(map second				;what filter spits out is straight elements from biglist, we want to trim out the first element from that, end up with just the indexes
		(filter					;filters out elements of biglist where it don't match up
			(fn [x] (= Ekeyword (first x)))		;returns true if ekeyword = the first element of the current element of biglist it's on
		BigListEmphToIndex)						;this is like [[:10 33874] [:20 8873]]
	)
)

(defn RtoI [Rkeyword]
	(map second
		(filter
			(fn [x] (= Rkeyword (first x)))
		BigListRhymeToIndex)
	)
)

(defn FindWordIndex [sp]
	(nth (nth									;the output of all this is like (["GHOST" 47165]), these nths get to the output we want under all those parens'n'stuff
		(filter
			(fn [x] (= (clojure.string/upper-case sp) (nth x 0)))				;this function compares sp with the 0 element in the vectors returned by SpellingA, that is to say, the spelling
			(map SpellingA EveryIndex)			;gives us a list of every spelling	(SpellingA returns a vector where 0 is the spelling and 1 is the index)
		)
	0 nil) 1)
)

(defn FindWordIndexA [sp]
	(SpellingToIndex 
		(keyword (clojure.string/upper-case sp))
	)
)

	(defn IndexToPronunciationVector [x]
		(clojure.string/split (Pronunciation x) #" ")
	)
	
	;accepts an index number.  Returns a sequence of all the words with the same number of phonemes
	(defn SameLength [x]
		(filter
			(fn [y]									;function to filter on
				(=
					(count (IndexToPronunciationVector x))			;this is the number of phonemes in the word
					(count (IndexToPronunciationVector y))
				)
			)
		EveryIndex)												;every index number, all 130000 of them or so
	)
	
	(defn SameLengthMinusOne [x]
		(filter
			(fn [y]									;function to filter on
				(=
					(- (count (IndexToPronunciationVector x)) 1)			;this is the number of phonemes in the word
					(count (IndexToPronunciationVector y))
				)
			)
		EveryIndex)												;every index number, all 130000 of them or so
	)
	
	(defn PhonemeLength [x, n]
		(filter
			(fn [y]									;function to filter on
				(=
					(+ (count (IndexToPronunciationVector x)) n)			;this is the number of phonemes in the word
					(count (IndexToPronunciationVector y))
				)
			)
		EveryIndex)												;every index number, all 130000 of them or so
	)

	;only takes words with the same number of phonemes
	;outputs the number of differences between them (when you line them up exactly)
	(defn DifferenceA [
		WordIndexA,
		WordIndexB]
		
		(def APron (IndexToPronunciationVector WordIndexA))
		(def BPron (IndexToPronunciationVector WordIndexB))
		
		(if (= (count APron) (count BPron))
			;then
			(reduce - (count APron)									;subtracts each member (1 or 0) successively from the total number of phonemes
				(map (fn [a] (if a 1 0))				;this mapping will give us a collection of 1s and 0s instead of trues and falses
					(map								;this mapping will give us a collection of trues and falses, a true for each match
						(fn [I]
							(= (nth APron I) (nth BPron I))				;is the phoneme they're on the same? return true or false
						)
						(range (count APron))			;this is just an index collection, like 0 1 2 3 4 etc
					)
				)
			)
			;else
			false
		)
	)
	
	;takes a word and a number, and finds other words with that many or fewer phoneme differences from that word, lined up one-to-one
	(defn PunA [wi, n]
		(filter
			(fn [x] (<= (DifferenceA wi x) n))			;is the word the function is on within n differences of the given word?
			(PhonemeLength wi, 0)
		)
	)
	
	;returns the vector supplied, without the element specified
	(defn TakeOutElement [vec, ele]
		(into []
			(concat
				(subvec vec 0 ele)
				(subvec vec (+ ele 1))
			)
		)
	)
	
	;takes a vector of phonemes, spits out a vector of vectors missing one element each
	(defn RemoveOne [x]
		(map
			(fn [a]
				(TakeOutElement x a)
			)
		(range (count x))			; index collection, like 0 1 2 3 4 etc
		)
	)
	
	
	
	(defn WordsMissingOne [x]
		(filter						;this filter goes through every word with phoneme count one less than the inputted word
			(fn [y]				;this has to determine whether any of the y words has the same pronunciation as one of the RemoveOne x words
				(first (filter true?			;this takes that coll of trues and falses and returns true if there's at least one true in it
					(or
						(map 						;this mapping returns a collection of trues or falses, trues for if there's a match
							(fn [z]
								(= z (IndexToPronunciationVector y))
							)
						(RemoveOne (IndexToPronunciationVector x))
						)
					)
				))
			)
			(PhonemeLength x, -1)
		)
	)

(println "doing natural english stuff...")
(println "slurping...")
;STUFF FOR FAKING GRAMMAR
	(defn NaturalEnglish [text]
		(remove clojure.string/blank?
			(clojure.string/split
				(slurp text)
				#"[^a-zA-Z']"
			)
		)
	)

(println "converting to index numbers")
	(def NaturalEnglishIndexNumbers
		(into []
			(remove nil?
				(map FindWordIndexA (NaturalEnglish "resources/pg98.txt"))
			)
		)
	)

(print "Making list of distinct keys")
	(defn distinctLinkedKeys [l]
		(distinct
			(map first l)
		)
	)

	(defn findInLinked [x, l]				;this goes through linked
		(flatten
			(map rest
				(filter 						;and returns whatever entries
					(fn [y] 					;have a 0th element equal to the term
						(= 						; that you put in
							(nth y 0)
							x
						)
					)
					l
				)
			)
		)
	)

;instead of creating them, I can slurp the serialized data straight, like this:

(def bigList
	(read-string
		(slurp "resources/ttc/biglist.txt")
	)
)
(def bigList2
	(read-string
		(slurp "resources/ttc/biglist2.txt")
	)
)
(def bigList3
	(read-string
		(slurp "resources/ttc/biglist3.txt")
	)
)


(defn CreateBigLists [x]

	(println "Linking to next word")
		(def linked
			(map
				(fn [a, b] [(keyword (str a)), b])
				NaturalEnglishIndexNumbers
				(rest NaturalEnglishIndexNumbers)
			)
		)

	(print "Making big list")
	(def bigList
		(reduce merge
			(map  										;this will go through each distinct key in the linked vector, they'll be called inDLK
				(fn [inDLK, i]
					(when (= 
						(/ i 100)
						(math/floor (/ i 100))
						)
						(print ".")
					)
					{
						inDLK
						(findInLinked inDLK linked)
					}
				)
				(distinctLinkedKeys linked)
				(range)
			)
		)
	)
	(println "")

	(println "Linking to next word 2")
		(def linked2
			(map
				(fn [a, b] [(keyword (str a)), b])
				NaturalEnglishIndexNumbers
				(rest (rest NaturalEnglishIndexNumbers))
			)
		)

	(print "Making big list 2")
	(def bigList2
		(reduce merge
			(map  										;this will go through each distinct key in the linked vector, they'll be called inDLK
				(fn [inDLK, i]
					(when (= 
						(/ i 100)
						(math/floor (/ i 100))
						)
						(print ".")
					)
					{
						inDLK
						(findInLinked inDLK linked2)
					}
				)
				(distinctLinkedKeys linked2)
				(range)
			)
		)
	)
	(println "")

	(println "Linking to next word 3")
		(def linked3
			(map
				(fn [a, b] [(keyword (str a)), b])
				NaturalEnglishIndexNumbers
				(rest (rest (rest NaturalEnglishIndexNumbers)))
			)
		)

	(print "Making big list 3")
	(def bigList3
		(reduce merge
			(map  										;this will go through each distinct key in the linked vector, they'll be called inDLK
				(fn [inDLK, i]
					(when (= 
						(/ i 100)
						(math/floor (/ i 100))
						)
						(print ".")
					)
					{
						inDLK
						(findInLinked inDLK linked3)
					}
				)
				(distinctLinkedKeys linked3)
				(range)
			)
		)
	)
	(println "")

)

(def distinctN
	(distinct NaturalEnglishIndexNumbers)
)

(println "Done with natural english stuff")

;FUNCTIONS FOR HUMAN USE, OR TO BE SERVED
	;Takes the spelling of a word and spits out puns.  For human use.
	(defn Pun [x]
		(map Spelling 
			(flatten (conj
				(PunA (FindWordIndex x) 1)
				(WordsMissingOne (FindWordIndex x))
			))
		)
	)
	
	
	
	;Takes the spelling of a word and spits out the spellings of all the words that rhyme with it.  For human use.
	(defn RhymesWith [x]
		(map Spelling
			(RtoI
				(nth (IndexToRhymeKeyword
					(FindWordIndex x)
				) 0)
			)
		)
	)

	;takes the spelling of a word and spits out the pronunciation.  For human use.
	(defn Pronounce [x]
		(Pronunciation
			(FindWordIndex x)
		)
	)

	;takes the spelling of a word and spits out the syllables.  For human use.
	(defn Syllables [x]
		(Emphases
			(FindWordIndex x)
		)
	)

	;same as syllables but javascript friendly OR NOT
	(defn Syllables2 [x]
		(clojure.string/join ", "
			(Emphases
				(FindWordIndex x)
			)
		)
	)

	(defn TextAsPhonemes [x]
		(flatten
			(map 
				(fn [x] (clojure.string/split x #" "))
				(map Pronunciation x)
			)
		)
	)

	(def DistinctPhonemes
		(distinct (TextAsPhonemes NaturalEnglishIndexNumbers))
	)

	(def NatPhon
		(TextAsPhonemes NaturalEnglishIndexNumbers)
	)

	(def NatPhon2 (into [] NatPhon))

	(defn IndividualPhonemeFrequency [x]
		(count
			(filter
				(fn [y] (= x y))
				NatPhon
			)
		)
	)

	(defn IndividualPhonemeFrequency2 [x]
		{x
			(count
				(filter
					(fn [y] (= x y))
					NatPhon
				)
			)
		}
	)

	;vector of all sets of two phonemes in a row, in order, from natural english input
	(def SetOf2NatPhon
		(map
			(fn [x]
				(str
					(nth NatPhon2 x)
					" "
					(nth NatPhon2 (+ x 1))
				)
			)
			(range(- (count NatPhon2) 1))
		)
	)

	(defn TwoPhonemeFrequency2 [x]
		{x
			(count
				(filter
					(fn [y] (= x y))
					SetOf2NatPhon
				)
			)
		}
	)

	(def DistinctSetsOf2
		(distinct SetOf2NatPhon)
	)

	(def ByTwos (sort-by second (map TwoPhonemeFrequency2 DistinctSetsOf2)))


	;takes the spelling of a word and spits out a list of words that come next in the text.  For human use.
	(defn GetNextWord [x]
		(map Spelling 
			(get bigList
				(keyword (str
					(FindWordIndexA x)
				))
			)
		)
	)

	(defn GetNextWord2 [x]
		(map Spelling 
			(get bigList2
				(keyword (str
					(FindWordIndexA x)
				))
			)
		)
	)

	(defn GetNextWord3 [x]
		(map Spelling 
			(get bigList3
				(keyword (str
					(FindWordIndexA x)
				))
			)
		)
	)

;x should be [it was]
	(defn GetNextWord12And [x]
		(let [word1 (nth x 1)
		 	  word2 (nth x 0)]

			(filter 
				(set (GetNextWord2 word2))				;set gives us an unordered unique set, like a hash but with no values, AND
				(GetNextWord word1)						;clojure treats the any set as a function, and the function is to take whatever input is being passed to the
			)											;function, in this case what the filter is passing in, and see if it exists in the set
		)
	)

	(defn GetNextWord123And [x]
		(let [word1 (nth x 2)
		 	  word2 (nth x 1)
		 	  word3 (nth x 0)]

			(filter 
				(set 
					(filter 
						(set (GetNextWord3 word3))
						(GetNextWord2 word2)
					)
				)	
				(GetNextWord word1)
			)
		)
	)

;OTHER USEFUL FUNCTIONS
	;returns not a list, but a single randomly chosen next word
	(defn GetRandomNextWord [x]
		(rand-nth (GetNextWord x))
	)

	(defn GetRandomNextWord2 [x]
		(let [word1 (nth x 1)
		 	  word2 (nth x 0)]

		 	[word1
		 	(rand-nth 
		 		(GetNextWord12And [word2 word1])
		 	)
		 	]
		)
	)

	(defn GetRandomNextWord3 [x]
		(let [word1 (nth x 2)
		 	  word2 (nth x 1)
		 	  word3 (nth x 0)]

		 	[word2 word1
		 	(rand-nth
		 		(GetNextWord123And [word3 word2 word1])
		 	)
		 	]

		)
	)
;STUFF FOR METRICAL ANALYSIS

	(defn SplitWords [x]
		(remove clojure.string/blank?
			(clojure.string/split
				x
				#"[^a-zA-Z]"
			)
		)
	)

	(defn AsMetrical [x]
		(flatten
			(map Emphases
				(filter (fn [x] (not= nil x))
					(map FindWordIndexA
						(SplitWords x)
					)
				)
			)
		)
	)

	(defn ByTwos [x]
		(map
			(fn [y]
				(str
					(nth x y)
					" "
					(nth x (+ y 1))
				)
			)
			(range (- (count x) 1))
		)
	)

	(defn isIamb? [x]
		(= x "0 1")
	)
	(defn isPyrrhus? [x]
		(= x "0 0")
	)
	(defn isTrochee? [x]
		(= x "1 0")
	)
	(defn isSpondee? [x]
		(= x "1 1")
	)

	(defn howManyIambs [x]
		(count
			(filter (fn [x] x)
				(map
					isIamb?
					(ByTwos (AsMetrical x))
				)
			)
		)
	)
	(defn howManyPyrrhuses [x]
		(count
			(filter (fn [x] x)
				(map
					isPyrrhus?
					(ByTwos (AsMetrical x))
				)
			)
		)
	)
	(defn howManyTrochees [x]
		(count
			(filter (fn [x] x)
				(map
					isTrochee?
					(ByTwos (AsMetrical x))
				)
			)
		)
	)
	(defn howManySpondees [x]
		(count
			(filter (fn [x] x)
				(map
					isSpondee?
					(ByTwos (AsMetrical x))
				)
			)
		)
	)

;ACTUAL PROGRAM STRUCTURE

	(def Scheme "0101010101a0101010101a")
	(def goalScheme (clojure.string/join (re-seq #"[0-2]" Scheme)))
	
	(defn CalculateEmph [VectorOfWordIndexes]
		(clojure.string/join (flatten (map Emphases VectorOfWordIndexes)))
	)
	
	(defn AddMirelle [VectorOfWordIndexes]
		(into [] (flatten(concat [VectorOfWordIndexes] [78678])))
	)
	
	;x should be a vector of word indexes, y should be the word index of the word you want to add to the end of it
	(defn AddWord [x y]
		(into [] (flatten (concat [x] [y])))
	)

	(def blankSentence
		(range 12)
	)

	(defn sentence [firstword]
		(vec
			(take 12
				(iterate GetRandomNextWord firstword)
			)
		)
	)

	(defn sentence3 [first3words]
		(map (fn [x] (nth x 2))
		(vec
			(take 20
				(iterate GetRandomNextWord3 first3words)
			)
		)
		)
	)
	

;WEB SERVER STUFF

(defn DoRequest [input]
	
(println "DoRequest function is called")

	(def allFunctions
		{
			"rhyme", RhymesWith
			"pun", Pun
			"rhymeswith", RhymesWith
			"pronounce", Pronounce
			"syllables", Syllables
			"nextword", GetNextWord
		}
	)

;get path
	(def functionToDo 
		(nth (nth 
			(re-seq #"\/(\w+)"
				(input :uri)
			)
		0) 1)
	)
		(println "Browser asked for: " functionToDo)

	(when (contains? allFunctions functionToDo)

		(def word
			(nth (nth
				(re-seq #"\/(\w+)"
					(input :uri)
				)
			1) 1)
		)

		(println "Doing" functionToDo "on" word)

	;	(def word
	;		(some-> (re-seq #"\/(\w+)" (input :uri))
	;			(nth 1)
	;			(nth 1)
	;		)
	;	)


		(vec ((get allFunctions functionToDo) word))

	)


)

(defn rhyme-server [channel request]



  (enqueue channel
    {:status 200
     :headers {"content-type" "text/plain"
 				"Access-Control-Allow-Origin" "*"}
     :body (str 
     	(DoRequest request)
     	)
     }))



(def app 
	(wrap-params rhyme-server))


(defn StartServer [x]
	(println "Starting server.")
	(start-http-server rhyme-server {:port x})
)

;(StartServer 8008)

;end of -main  
)

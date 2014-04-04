(ns language.core
  (:gen-class))

(defn -main
  "Language functionality."
  [& args]
  ;(println "Hello, World!")
  
  ;to run this, start command, go to c:\language and type lein repl, then when the repl starts type (-main)

;PROGRAM STUFF
  
  ;makes it so that you can use string-manipulation functions
  (require 'clojure.string)
  
;GENERAL ALL-PURPOSE LANGUAGE MACHINERY
  
  ;creates a vector called DictVector which has each line in cmudict separately
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
	
  ;makes a list containing all the indeces for DictVector, so they can be doseqed through
  (def EveryIndex (range (count DictVector)))
  
	(def BigListEmphToIndex
		(map IndexToEmphasesKeyword EveryIndex)			;BIG list of [:emphases wordindex]
	)
	
	(def BigListRhymeToIndex
		(map IndexToRhymeKeyword EveryIndex)			;big list of [:rhyme wordindex]
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

;STUFF FOR FAKING GRAMMAR
	(def NaturalEnglish 
		(remove clojure.string/blank?
			(clojure.string/split
				(slurp "resources/afewpages.txt")
				#"[^a-zA-Z]"
			)
		)
	)
	;do a map with FindWordIndex

	(def NaturalEnglishIndexNumbers
		(remove nil?
			(map FindWordIndex NaturalEnglish)
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
	

	
	
	
;end of -main  
)

language
========

Language tools


How to make this work:
lein run
lein repl
(-main)

that'll load all the functions into, like, clojure-space or the JVM or something so you can use them.  Then you can go like:

(RhymesWith "matt")

And get actual output!

If you change anything in the source (core.clj), you have to do lein run before you'll be able to access that change in the repl
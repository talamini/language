(defproject language "0.1.1"
  :description "language tools"
  :url "none"
  :license {:name "none"
            :url "none"}
  :dependencies [[org.clojure/clojure "1.5.1"]
  				 [org.clojure/math.numeric-tower "0.0.4"]
  				 [aleph "0.3.2"]
  				 [ring "1.1.5"]]
  :main ^:skip-aot language.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all}})

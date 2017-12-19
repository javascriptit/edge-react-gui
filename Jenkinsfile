node {
  try {
    stage ("checkout") {
      checkout scm
    }

    stage ("install dependencies") {
      sh "npm i"
    }

    stage ("test") {
      sh "npm test"
    }

    stage ("build") {
      sh "npm run build"
    }
  }
  catch(err) {
    // Do not add a stage here.
    // When "stage" commands are run in a different order than the previous run
    // the history is hidden since the rendering plugin assumes that the system has changed and
    // that the old runs are irrelevant. As such adding a stage at this point will trigger a
    // "change of the system" each time a run fails.
    println "Something went wrong!"
    println err
  }
  finally {
    println "Fin"
  }
}
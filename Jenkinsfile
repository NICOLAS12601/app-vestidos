pipeline {
  agent any

  options {
    timestamps()
  }

  stages {
    stage('Checkout') {
      steps {
        // ...existing code...
        checkout scm
      }
    }

    stage('Sanity') {
      steps {
        sh """
          echo "Jenkins running on: \$(uname -a)"
          echo "Workspace: \${PWD}"
          ls -la
          echo "OK"
        """
      }
    }
  }

  post {
    success {
      echo "Pipeline OK (minimal, no Docker/Node required)."
    }
    failure {
      echo "Pipeline FAIL"
    }
  }
}
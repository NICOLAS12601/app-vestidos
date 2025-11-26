pipeline {
  agent {
    docker {
      image 'node:20-alpine'
      args '-v /var/jenkins_home/.npm:/root/.npm'
    }
  }

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

    stage('Install') {
      steps {
        sh """
          set -e
          if [ -f package-lock.json ]; then
            npm ci
          else
            npm install
          fi
        """
      }
    }

    stage('TypeCheck') {
      steps {
        sh "npx tsc --noEmit"
      }
    }

    stage('Lint') {
      steps {
        sh "npm run lint || echo 'Lint warnings/errors (non-blocking)'"
      }
    }

    stage('Build') {
      steps {
        sh "npm run build"
      }
    }

    stage('Smoke') {
      steps {
        sh """
          test -d .next || (echo 'Build output missing (.next)' && exit 1)
          echo 'Smoke OK'
        """
      }
    }
  }

  post {
    success {
      echo "Pipeline OK"
    }
    failure {
      echo "Pipeline FAIL"
    }
  }
}
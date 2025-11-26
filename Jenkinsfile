pipeline {
  agent any

  options {
    timestamps()
  }

  environment {
    IMAGE_NAME = "app-vestidosgrupo5"
    IMAGE_TAG  = "latest"
    CONTAINER_NAME = "jenkins-ci-app"
    PORT = "3000"
  }

  stages {
    stage('Checkout') {
      steps {
        // ...existing code...
        checkout scm
      }
    }

    stage('Build') {
      steps {
        echo "Verificando disponibilidad de Docker en el agente..."
        script {
          def hasDocker = sh(script: 'command -v docker >/dev/null 2>&1 && echo YES || echo NO', returnStdout: true).trim() == 'YES'
          if (hasDocker) {
            echo "Docker disponible. Construyendo imagen..."
            sh """
              docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
            """
          } else {
            echo "Docker NO disponible en el agente. Ejecutando build de Node como fallback..."
            sh """
              set -e
              if [ -f package-lock.json ]; then
                npm ci
              else
                npm install
              fi
              npm run build
            """
          }
        }
      }
    }

    stage('Test') {
      steps {
        echo "Ejecutando tests de smoke..."
        script {
          def hasDocker = sh(script: 'command -v docker >/dev/null 2>&1 && echo YES || echo NO', returnStdout: true).trim() == 'YES'
          if (hasDocker) {
            echo "Docker disponible. Testeando la imagen en contenedor..."
            sh """
              set -e
              docker rm -f ${CONTAINER_NAME} || true
              docker run -d --name ${CONTAINER_NAME} -p ${PORT}:${PORT} ${IMAGE_NAME}:${IMAGE_TAG}
              echo "Esperando a que la app levante..."
              for i in \$(seq 1 30); do
                sleep 2
                if docker logs ${CONTAINER_NAME} 2>&1 | grep -q "Ready"; then
                  echo "Contenedor listo."
                  break
                fi
              done
              wget -q --spider http://localhost:${PORT}/ || (echo "Smoke test failed" && exit 1)
              echo "Smoke test OK."
            """
          } else {
            echo "Docker NO disponible. Ejecutando smoke test de build de Node..."
            sh """
              test -d .next || (echo "No se encontró el output de build (.next). Asegúrate que 'npm run build' corrió en la etapa Build." && exit 1)
              echo "Smoke test OK (fallback)."
            """
          }
        }
      }
      post {
        always {
          script {
            def hasDocker = sh(script: 'command -v docker >/dev/null 2>&1 && echo YES || echo NO', returnStdout: true).trim() == 'YES'
            if (hasDocker) {
              sh "docker rm -f ${CONTAINER_NAME} || true"
            }
          }
        }
      }
    }

    // stage('Deploy') { steps { /* ... */ } }
  }

  post {
    success {
      echo "Pipeline OK: build/test completados."
    }
    failure {
      echo "Pipeline FAIL: revisar logs de build/test."
    }
  }
}
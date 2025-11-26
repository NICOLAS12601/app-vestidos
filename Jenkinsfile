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
        echo "Construyendo la imagen Docker..."
        sh """
          docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
        """
      }
    }

    stage('Test') {
      steps {
        echo "Probando la imagen..."
        // Ejecutar el contenedor y verificar que arranca
        sh """
          set -e
          # limpiar si quedó uno previo
          docker rm -f ${CONTAINER_NAME} || true

          # correr contenedor en background
          docker run -d --name ${CONTAINER_NAME} -p ${PORT}:${PORT} ${IMAGE_NAME}:${IMAGE_TAG}

          # esperar a que arranque Next.js
          echo "Esperando a que la app levante..."
          for i in \$(seq 1 30); do
            sleep 2
            if docker logs ${CONTAINER_NAME} 2>&1 | grep -q "Ready"; then
              echo "Contenedor listo."
              break
            fi
          done

          # smoke test: intentar obtener la home
          curl --fail --silent --show-error http://localhost:${PORT}/ >/dev/null

          echo "Smoke test OK."
        """
      }
      post {
        always {
          // limpiar contenedor de prueba
          sh "docker rm -f ${CONTAINER_NAME} || true"
        }
      }
    }

    // stage('Deploy') { steps { /* ... */ } }
  }

  post {
    success {
      echo "Pipeline OK: imagen ${IMAGE_NAME}:${IMAGE_TAG} construida y testeada."
    }
    failure {
      echo "Pipeline FAIL: revisar logs de build/test."
    }
  }
}
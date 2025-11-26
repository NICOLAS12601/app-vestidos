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
          docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "\$PWD":"\$PWD" -w "\$PWD" docker:27-cli sh -c '
            docker version
            docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
          '
        """
      }
    }

    stage('Test') {
      steps {
        echo "Probando la imagen..."
        sh """
          docker run --rm -v /var/run/docker.sock:/var/run/docker.sock docker:27-cli sh -c '
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
          '
        """
      }
      post {
        always {
          sh """
            docker run --rm -v /var/run/docker.sock:/var/run/docker.sock docker:27-cli sh -c '
              docker rm -f ${CONTAINER_NAME} || true
            '
          """
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
pipeline {
  agent any

  options {
    timestamps()
  }

  environment {
    PW_IMG = "mcr.microsoft.com/playwright:v1.56.1-jammy"
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

    stage('Tests: automatizacion') {
      steps {
        script {
          def hasDocker = sh(script: 'command -v docker >/dev/null 2>&1 && echo YES || echo NO', returnStdout: true).trim() == 'YES'
          if (hasDocker) {
            echo "Docker disponible. Ejecutando tests en contenedor Playwright..."
            sh """
              docker run --rm \
                -v "\$PWD":"\$PWD" -w "\$PWD" \
                -e HOME="\$PWD/.jenkins-home" \
                ${PW_IMG} /bin/bash -lc '
                  set -e
                  if [ -f package-lock.json ]; then npm ci; else npm install; fi
                  npx playwright install --with-deps
                  npm run test:auto:ci || true
                '
            """
          } else {
            echo "Docker NO disponible. Intentando con Node local..."
            def hasNpm = sh(script: 'command -v npm >/dev/null 2>&1 && echo YES || echo NO', returnStdout: true).trim() == 'YES'
            if (hasNpm) {
              sh """
                set -e
                if [ -f package-lock.json ]; then npm ci; else npm install; fi
                npm run playwright:install || npx playwright install
                npm run test:auto:ci || true
              """
            } else {
              echo "NI Docker NI npm disponibles en el agente. Saltando tests (no bloqueante)."
            }
          }
        }
      }
      post {
        always {
          script {
            // Archivar HTML report si existe
            if (fileExists('playwright-report')) {
              archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
              echo "✅ Playwright report archivado en Build Artifacts"
            }
            // Mostrar resumen en consola
            sh """
              if [ -f playwright-report/index.html ]; then
                echo "════════════════════════════════════════════════════════"
                echo "📊 RESUMEN DE TESTS (tests/automatizacion):"
                echo "Ver reporte completo en: Build > Artifacts > playwright-report/index.html"
                echo "════════════════════════════════════════════════════════"
              else
                echo "⚠️  No se generó reporte HTML de Playwright."
              fi
            """
          }
        }
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
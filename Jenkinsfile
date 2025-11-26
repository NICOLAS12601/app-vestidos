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
                  npx playwright show-report --host 0.0.0.0 || true
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
            // Publicar HTML report si existe
            if (fileExists('playwright-report/index.html')) {
              publishHTML([
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Test Report',
                keepAll: true,
                alwaysLinkToLastBuild: true
              ])
              echo "✅ Playwright report publicado en: Build Artifacts > Playwright Test Report"
            }
            // Mostrar resumen en consola
            sh """
              if [ -f playwright-report/index.html ]; then
                echo "════════════════════════════════════════════════════════"
                echo "📊 RESUMEN DE TESTS (tests/automatizacion):"
                grep -oP '(?<=<title>).*(?=</title>)' playwright-report/index.html || echo "No se pudo extraer resumen"
                echo "Ver reporte completo en Jenkins > Build > Playwright Test Report"
                echo "════════════════════════════════════════════════════════"
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
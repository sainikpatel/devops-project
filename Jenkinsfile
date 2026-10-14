
pipeline {
    agent any

    environment {
        PATH = "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
        APP_PORT = "3000"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/sainikpatel/devops-project.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                sh 'node --check server.js'
                echo 'Build checks passed!'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    set -eu

                    PID_FILE="$WORKSPACE/app.pid"
                    LOG_FILE="$WORKSPACE/app.log"

                    # Stop the previous deployment if its PID is alive.
                    if [ -f "$PID_FILE" ]; then
                        OLD_PID=$(cat "$PID_FILE")

                        if kill -0 "$OLD_PID" 2>/dev/null; then
                            kill "$OLD_PID" || true
                            sleep 2
                        fi

                        rm -f "$PID_FILE"
                    fi

                    # Start Node directly and preserve it after the build.
                    export JENKINS_NODE_COOKIE=dontKillMe
                    nohup node server.js > "$LOG_FILE" 2>&1 &
                    APP_PID=$!
                    echo "$APP_PID" > "$PID_FILE"

                    # Wait for a real successful health response.
                    for i in $(seq 1 20); do
                        if curl --fail --silent \
                            "http://127.0.0.1:${APP_PORT}/health" \
                            -o /dev/null; then
                            echo "Deployment successful!"
                            echo "Application: http://localhost:${APP_PORT}"
                            echo "Health: http://localhost:${APP_PORT}/health"
                            exit 0
                        fi

                        if ! kill -0 "$APP_PID" 2>/dev/null; then
                            echo "Application exited unexpectedly."
                            cat "$LOG_FILE"
                            exit 1
                        fi

                        sleep 1
                    done

                    echo "Health check timed out."
                    cat "$LOG_FILE"
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo 'CI/CD pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check Console Output for details.'
        }
    }
}

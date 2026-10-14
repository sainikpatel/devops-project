
pipeline {
    agent any

    environment {
        PATH = "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
        APP_PORT = "3000"
        APP_DIR = "${WORKSPACE}"
        PID_FILE = "${WORKSPACE}/app.pid"
        LOG_FILE = "${WORKSPACE}/app.log"
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

                    # Stop the previous app started by this pipeline, if any.
                    if [ -f "$PID_FILE" ]; then
                        OLD_PID=$(cat "$PID_FILE")

                        if kill -0 "$OLD_PID" 2>/dev/null; then
                            kill "$OLD_PID" || true

                            # Wait briefly for graceful shutdown.
                            for i in $(seq 1 10); do
                                kill -0 "$OLD_PID" 2>/dev/null || break
                                sleep 1
                            done

                            # Do not kill a process that refuses to stop.
                            if kill -0 "$OLD_PID" 2>/dev/null; then
                                echo "Previous app did not stop; aborting deployment."
                                exit 1
                            fi
                        fi

                        rm -f "$PID_FILE"
                    fi

                    # Start the updated application.
                    nohup npm start > "$LOG_FILE" 2>&1 &
                    APP_PID=$!
                    echo "$APP_PID" > "$PID_FILE"

                    # Wait for the health endpoint.
                    for i in $(seq 1 20); do
                        if curl --fail --silent \
                            "http://127.0.0.1:${APP_PORT}/health" >/dev/null; then
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

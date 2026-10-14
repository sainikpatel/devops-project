
stage('Deploy') {
    steps {
        sh '''
            set -eu

            APP_PORT=3000
            PID_FILE="$WORKSPACE/app.pid"
            LOG_FILE="$WORKSPACE/app.log"

            # Stop the previous app started by this pipeline.
            if [ -f "$PID_FILE" ]; then
                OLD_PID=$(cat "$PID_FILE")

                if kill -0 "$OLD_PID" 2>/dev/null; then
                    kill "$OLD_PID" || true
                    sleep 2
                fi

                rm -f "$PID_FILE"
            fi

            # Prevent Jenkins from cleaning up this app process.
            JENKINS_NODE_COOKIE=dontKillMe
            export JENKINS_NODE_COOKIE

            nohup node server.js > "$LOG_FILE" 2>&1 &
            APP_PID=$!
            echo "$APP_PID" > "$PID_FILE"

            # Verify that the server actually responds.
            for i in $(seq 1 20); do
                if curl --fail --silent \
                    "http://127.0.0.1:${APP_PORT}/health"; then
                    echo ""
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

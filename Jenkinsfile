pipeline {
    agent {
        label 'macos'
    }

    parameters {
        string(name: 'VERSION_NAME', defaultValue: '1.0.0', description: 'The release version name (e.g., 1.0.0)')
    }

    environment {
        // Use Jenkins credentials by setting the credential ID.
        // These IDs must be configured in your Jenkins instance.
        APPLE_ID          = credentials('APPLE_ID')
        APPLE_PASSWORD    = credentials('APPLE_APP_SPECIFIC_PASSWORD')
        TEAM_ID           = credentials('APPLE_TEAM_ID')
        SIGNING_IDENTITY  = credentials('MACOS_SIGNING_IDENTITY')

        // Define paths
        RELEASE_DIR       = "macos/release"
        ARCHIVE_NAME      = "LottieViewer-macOS-${params.VERSION_NAME}.zip"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install JS Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Install Ruby Dependencies') {
            steps {
                // Installs gems like cocoapods into a local ./vendor/bundle directory
                sh 'bundle config set --local path vendor/bundle'
                sh 'bundle install'
            }
        }

        stage('Install macOS Dependencies') {
            steps {
                dir('macos') {
                    sh 'bundle exec pod install'
                }
            }
        }

        stage('Build macOS App') {
            steps {
                dir('macos') {
                    script {
                        def signingArgs = 'CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO'
                        if (env.SIGNING_IDENTITY) {
                            echo "Code signing is ENABLED."
                            signingArgs = "CODE_SIGN_IDENTITY='${env.SIGNING_IDENTITY}' CODE_SIGN_STYLE=Manual DEVELOPMENT_TEAM='${env.TEAM_ID}'"
                        } else {
                            echo "Code signing is DISABLED."
                        }

                        // Clean previous build
                        sh 'rm -rf build'
                        
                        // Use sh to execute the xcodebuild command
                        sh """
                        xcodebuild -workspace LottieViewer.xcworkspace \
                            -scheme LottieViewer-macOS \
                            -configuration Release \
                            -derivedDataPath build \
                            ${signingArgs}
                        """
                    }
                }
            }
        }

        stage('Package Release') {
            steps {
                dir('macos') {
                    sh """
                    echo "Packaging release..."
                    APP_BUNDLE=\$(find build -name "LottieViewer.app" -type d | head -1)

                    if [ -z "\$APP_BUNDLE" ]; then
                        echo "Error: Could not find LottieViewer.app bundle"
                        exit 1
                    fi

                    mkdir -p "${env.RELEASE_DIR}"
                    rm -rf "${env.RELEASE_DIR}/LottieViewer.app"
                    cp -R "\$APP_BUNDLE" "${env.RELEASE_DIR}/LottieViewer.app"

                    cd "${env.RELEASE_DIR}"
                    zip -r "${env.ARCHIVE_NAME}" LottieViewer.app
                    """
                }
            }
        }

        stage('Notarize Application') {
            // This stage only runs if all necessary credentials for notarization are present.
            when {
                expression { 
                    return env.APPLE_ID && env.APPLE_PASSWORD && env.TEAM_ID && env.SIGNING_IDENTITY 
                }
            }
            steps {
                dir("${env.RELEASE_DIR}") {
                    sh """
                    echo "Starting Notarization..."
                    xcrun notarytool submit "${env.ARCHIVE_NAME}" \
                        --apple-id "${env.APPLE_ID_USR}" \
                        --password "${env.APPLE_PASSWORD_PSW}" \
                        --team-id "${env.TEAM_ID_USR}" \
                        --wait

                    echo "Stapling notarization ticket to the app..."
                    xcrun stapler staple "LottieViewer.app"

                    echo "Re-zipping stapled app..."
                    rm "${env.ARCHIVE_NAME}"
                    zip -r "${env.ARCHIVE_NAME}" LottieViewer.app
                    """
                }
            }
        }
    }

    post {
        always {
            echo 'Build finished.'
            script {
                archiveArtifacts artifacts: "macos/release/LottieViewer-macOS-*.zip", followSymlinks: false
            }
        }
        success {
            echo 'Build was successful! Creating git tag...'
            script {
                def tagName = "rc${params.VERSION_NAME}"
                if (server.getTags().find { it.name == tagName }) {
                    echo "Tag '${tagName}' already exists. Skipping tag creation."
                } else {
                    sh "git tag -a '${tagName}' -m 'Jenkins build: Release candidate ${params.VERSION_NAME}'"
                    // To push the tag, you would need to configure credentials for your Git repository
                    // withCredentials([gitUsernamePassword(credentialsId: 'GIT_REPO_CREDENTIALS')]) {
                    //     sh 'git push origin --tags'
                    // }
                    echo "Successfully created tag '${tagName}'. Manual push required."
                }
            }
        }
    }
}

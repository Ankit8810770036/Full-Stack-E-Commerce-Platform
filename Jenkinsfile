pipeline {
    agent any
    environment {
        REGISTRY = 'ghcr.io'
        IMAGE_PREFIX = 'ecommerce-app'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Maven Services') {
            steps {
                dir('user-service') {
                    bat 'mvn clean package -DskipTests'
                }
                dir('product-service') {
                    bat 'mvn clean package -DskipTests'
                }
                dir('order-service') {
                    bat 'mvn clean package -DskipTests'
                }
                dir('api-gateway') {
                    bat 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build & Push Docker Images') {
            steps {
                script {
                    bat 'docker build -t user-service:latest ./user-service'
                    bat 'docker build -t product-service:latest ./product-service'
                    bat 'docker build -t order-service:latest ./order-service'
                    bat 'docker build -t api-gateway:latest ./api-gateway'
                    bat 'docker build -t frontend:latest ./frontend'
                }
            }
        }

        stage('Deploy to Staging') {
            steps {
                bat 'docker compose down'
                bat 'docker compose up -d'
                echo "Successfully deployed stack to Staging environment."
            }
        }

        stage('Approval Gate') {
            steps {
                input message: 'Deploy stack to Production Kubernetes cluster?', ok: 'Yes, Deploy'
            }
        }

        stage('Production Deploy') {
            steps {
                echo "Deploying to Kubernetes cluster via k8s manifests..."
                bat 'kubectl apply -k k8s/'
                echo "Successfully rolled out deployment across Kubernetes cluster."
            }
        }
    }
}

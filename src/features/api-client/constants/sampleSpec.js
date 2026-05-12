export const SAMPLE_SPEC = `openapi: 3.0.3
info:
  title: Notes API
  version: 1.0.0
  description: A compact sample API for trying the client.
servers:
  - url: https://jsonplaceholder.typicode.com
    description: Public demo server
paths:
  /posts:
    get:
      tags:
        - Posts
      summary: List posts
      description: Returns posts with optional filtering.
      parameters:
        - name: userId
          in: query
          required: false
          description: Filter posts by user id.
          schema:
            type: integer
            example: 1
      responses:
        '200':
          description: A list of posts.
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Post'
    post:
      tags:
        - Posts
      summary: Create post
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PostInput'
      responses:
        '201':
          description: Created post.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Post'
  /posts/{id}:
    get:
      tags:
        - Posts
      summary: Get post
      parameters:
        - name: id
          in: path
          required: true
          description: Post id.
          schema:
            type: integer
            example: 1
      responses:
        '200':
          description: The post.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Post'
  /comments:
    get:
      tags:
        - Comments
      summary: Search comments
      parameters:
        - name: postId
          in: query
          schema:
            type: integer
            example: 1
      responses:
        '200':
          description: Matching comments.
components:
  schemas:
    Post:
      type: object
      properties:
        userId:
          type: integer
          example: 1
        id:
          type: integer
          example: 101
        title:
          type: string
          example: Build a friendlier API client
        body:
          type: string
          example: Keep the request, docs, and response together.
    PostInput:
      type: object
      required:
        - title
        - body
        - userId
      properties:
        title:
          type: string
          example: Build a friendlier API client
        body:
          type: string
          example: Keep the request, docs, and response together.
        userId:
          type: integer
          example: 1
`

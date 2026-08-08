window.CKAD_TOPIC = {
  "slug": "crd",
  "title": "CRDs",
  "weight": null,
  "preamble": [
    {
      "type": "text",
      "html": "- Note: CRD is part of the new CKAD syllabus. Here are a few examples of installing custom resource into the Kubernetes API by creating a CRD."
    }
  ],
  "sections": [
    {
      "heading": "CRD in K8s",
      "id": "crd-in-k8s",
      "blocks": [
        {
          "type": "exercise",
          "id": "ex-0",
          "question": "Create a CustomResourceDefinition manifest file for an Employee resource with the following specifications :",
          "setup": [
            {
              "type": "list",
              "items": [
                "<em>Group</em> : <code>hr.example.com</code>",
                "<em>Schema</em>: <code>&lt;contact: string&gt;&lt;nickname: string&gt;&lt;level: integer&gt;</code>",
                "<em>Scope</em>: <code>Namespaced</code>",
                "<em>Names</em>: <code>&lt;plural: employees&gt;&lt;singular: employee&gt;&lt;shortNames: emp&gt;</code>",
                "<em>Kind</em>: <code>Employee</code>"
              ]
            }
          ],
          "answer": [
            {
              "type": "code",
              "language": "yaml",
              "code": "apiVersion: apiextensions.k8s.io/v1\nkind: CustomResourceDefinition\nmetadata:\n  # name must match the spec fields below, and be in the form: <plural>.<group>\n  name: employees.hr.example.com\nspec:\n  group: hr.example.com\n  versions:\n    - name: v1\n      served: true\n      # One and only one version must be marked as the storage version.\n      storage: true\n      schema:\n        openAPIV3Schema:\n          type: object\n          properties:\n            spec:\n              type: object\n              properties:\n                contact:\n                  type: string\n                nickname:\n                  type: string\n                level:\n                  type: integer\n  scope: Namespaced\n  names:\n    plural: employees\n    singular: employee\n    # kind is normally the CamelCased singular type. Your resource manifests use this.\n    kind: Employee\n    shortNames:\n    - emp"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-1",
          "question": "Create the CRD resource in the K8S API",
          "setup": [],
          "answer": [
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f employee-crd.yml"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-2",
          "question": "Create custom object from the CRD",
          "setup": [
            {
              "type": "list",
              "items": [
                "<em>Kind</em>: <code>Employee</code>",
                "Spec:",
                "contact: <code>jane.ross@hr.example.com</code>",
                "nickname: <code>jane ross</code>",
                "level: <code>30</code>"
              ]
            }
          ],
          "answer": [
            {
              "type": "code",
              "language": "yaml",
              "code": "apiVersion: hr.example.com/v1\nkind: Employee\nmetadata:\n  name: jane-ross\nspec:\n  contact: jane.ross@hr.example.com\n  nickname: \"jane ross\"\n  level: 30"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl apply -f employee.yml"
            }
          ]
        },
        {
          "type": "exercise",
          "id": "ex-3",
          "question": "Listing employees",
          "setup": [],
          "answer": [
            {
              "type": "text",
              "html": "Use singular, plural and short forms"
            },
            {
              "type": "code",
              "language": "bash",
              "code": "kubectl get employees\nor\nkubectl get employee\nor\nkubectl get emp"
            }
          ]
        }
      ]
    }
  ],
  "count": 4,
  "description": "Custom resource definitions.",
  "file": "i.crd.md"
};

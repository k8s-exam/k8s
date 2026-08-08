# CRDs

- Note: CRD is part of the new CKAD syllabus. Here are a few examples of installing custom resource into the Kubernetes API by creating a CRD.

## CRD in K8s

### Create a CustomResourceDefinition manifest file for an Employee resource with the following specifications :
* *Name* : `employees.hr.example.com`
* *Group* : `hr.example.com`
* *Schema*: `<contact: string><nickname: string><level: integer>`
* *Scope*: `Namespaced`
* *Names*: `<plural: employees><singular: employee><shortNames: emp>`
* *Kind*: `Employee`

<details><summary>show</summary>
<p>

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  # name must match the spec fields below, and be in the form: <plural>.<group>
  name: employees.hr.example.com
spec:
  group: hr.example.com
  versions:
    - name: v1
      served: true
      # One and only one version must be marked as the storage version.
      storage: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              properties:
                contact:
                  type: string
                nickname:
                  type: string
                level:
                  type: integer
  scope: Namespaced
  names:
    plural: employees
    singular: employee
    # kind is normally the CamelCased singular type. Your resource manifests use this.
    kind: Employee
    shortNames:
    - emp
```

</p>
</details>

### Create the CRD resource in the K8S API

<details><summary>show</summary>
<p>

```bash
kubectl apply -f employee-crd.yml
```

</p>
</details>

### Create custom object from the CRD

* *Name* : `jane-ross`
* *Kind*: `Employee`
* Spec:
  * contact: `jane.ross@hr.example.com`
  * nickname: `jane ross`
  * level: `30`

<details><summary>show</summary>
<p>

```yaml
apiVersion: hr.example.com/v1
kind: Employee
metadata:
  name: jane-ross
spec:
  contact: jane.ross@hr.example.com
  nickname: "jane ross"
  level: 30
```

```bash
kubectl apply -f employee.yml
```

</p>
</details>

### Listing employees

<details><summary>show</summary>
<p>

Use singular, plural and short forms

```bash
kubectl get employees
or
kubectl get employee
or
kubectl get emp
```

</p>
</details>

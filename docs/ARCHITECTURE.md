**Frontend: Angular**
- Builder UI, Runtime UI, Visual Editor

Communicates with backend via HTTP/Websocket
**Backend: Spring Boot**
- API, Authentication, Application Management
Application Engine

- Renders definitions, evaluates logic, executes actions
Persistence Layer

- Stores application definitions, runtime data, users

**Database: PostgreSQL**

# Design Decisions
## Hybrid component architecture
Components can be simple visual elements or complex, reusable modules. Complex modules can be composed of smaller components and can package their own data and logic.

**Primitive components** are the most basic building blocks, including text, inputs, buttons, containers, charts, and tables
**Composite components** are created by users by combining other components

This allows for creating templates, reusable modules, and more complex nesting behavior.

## Centralized application data
Variables belong to the application data model, not individual components.

Because in practice components will be accessed from multiple components, it makes more sense to have them all globally accessible. Naming conflicts will be resolved with namespaces.

## Independent variable creation
Users can create variables separately or as part of component configuration.

The variables are separate from the way they are displayed, and theoretically the user may want to enter the data in first before deciding how to build a component for it.

## Hierarchical namespaces
Namespaces can contain other namespaces, to allow for more flexibility in repeating variable names.

When a new variable is created, a name will be generated for it:
- If it's created on initialization of a component, it will be automatically placed in that component's namespace
- If it's created outside of a component, it will be automatically either placed at the root or wherever the user places it in the variable folders
- If a variable is deleted from a component (but still exists in the database), what to do?
  - Delete the variable if it has no references
  - If the variable is referenced in another component, use that component as the namespace
- The user can change what folder it's in from the application editor

 ## Recursive, nested user-defined types
 Users can define their own types, and user-defined types can contain both primitive types and custom types. Additionally, a type could contain itself, like in the case of an Item storing other Items.

 Safeguards:
 - Prevent infinitely deep nesting
 - Detect circular type definitions where they aren't meaningful
 - Validate values against declared types
 - Distinguish object identity from object contents

 ## Support explicit and inferred type declaration
 Users shouldn't need programming experience to use the platform, but they should also be able to have granular control if they want it.
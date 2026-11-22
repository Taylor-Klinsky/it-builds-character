# Project Overview

## Vision

A highly customizable, collaborative application-building platform initially designed for tabletop role-playing games (TTRPGs).

The goal is to give users the freedom of a spreadsheet, the modularity of a component-based application builder, and the expressive power of a visual programming environment.

Rather than building a fixed character sheet application, the platform will allow users to create their own applications from customizable components, variables, formulas, and interactive workflows.

Character sheets are the initial use case, but the underlying platform should be general-purpose enough to support entirely different tabletop systems and applications.

## Core Design Philosophy

**Build a platform for creating applications, not an application with customizable fields.**

The platform should prioritize:

- **Extensibility:** New component types, operations, data types, and integrations should be possible without redesigning the underlying architecture.
- **Composability:** Users should be able to combine smaller building blocks to create increasingly complex components and applications.
- **Declarative configuration:** Users define what an application should look like and how it should behave without needing to write application code.
- **Separation of concerns:** Data, presentation, logic, and collaboration should operate as distinct but interconnected systems.
- **Reusability:** Components and complete applications should be reusable, shareable, and customizable.
- **Collaboration:** Multiple users should eventually be able to interact with the same application simultaneously.
- **Non-destructive operations by default:** Where practical, preserve historical versions, prefer archiving over deletion, prefer reversible changes, maintain audit histories for important operations, and require explicit confirmation for irreversible actions.

## 1. Core Architecture

The platform will consist of four primary subsystems.

### Interface Engine

Responsible for defining and rendering application interfaces.

Potential functionality:
- Customizable layouts and containers.
- Buttons, text fields, sliders, dropdowns, and other controls.
- Tables, charts, progress bars, and other display elements.
- Drag-and-drop component organization.
- Customizable styling and appearance.
- Nested and reusable components.
- Data binding between interface elements and variables.

The interface engine should not need to understand the meaning of the data it displays.

For example, a progress bar should be able to display health, mana, experience, or any other compatible numeric value.

### Data Engine

Responsible for defining, storing, and managing application data.

Potential functionality:
- User-defined variables.
- Primitive data types (numbers, strings, booleans, dates).
- Complex data types (objects, arrays, collections).
- Custom data types.
- Variable references and relationships.
- Data validation and type checking.
- Data binding.
- Automatic recalculation of dependent values.

Data definitions should be distinct from their actual values.

For example, a reusable Health Tracker component might define `currentHealth` and `maximumHealth`, while individual characters maintain their own values.

### Logic Engine

Responsible for defining and executing application behavior.

Two major systems should work together:

**Dependency Engine**

Handles automatic calculations and relationships between variables.

Potential functionality:
- Spreadsheet-style formulas.
- Variable references.
- Automatic recalculation.
- Dependency tracking.
- Circular dependency detection.
- Formula validation.

**Event Engine**

Handles user-triggered and automatic actions.

Potential functionality:
- Event triggers (click, change, submit, etc.).
- Conditional logic (if/else).
- Mathematical and logical operations.
- Multi-step workflows.
- Operations that modify multiple variables.
- Cross-component interactions.
- Execution history and error handling.

The two systems should be distinct but interoperable. For example, an event can modify a variable, which triggers recalculation of dependent formulas.

### Collaboration Engine

Responsible for synchronizing application state between users.

Potential functionality:
- Shared workspaces and applications.
- User roles and permissions.
- Real-time updates through WebSockets.
- Concurrent modification handling.
- Change history and audit logs.
- Undo and rollback functionality.

Initially, collaboration should focus on synchronizing application state rather than simultaneous editing of application definitions.

---

## 2. Application Structure

A fundamental architectural distinction is between an application's definition and its runtime instance.

### Definitions

Definitions describe how an application is constructed.

- **Application Definition:** Blueprint for an entire application.
- **Component Definition:** Blueprint for a reusable component.
- **Data Definition:** Describes variables and their types.
- **Logic Definition:** Describes formulas and workflows.
- **Layout Definition:** Describes the application's visual structure.

### Instances

Instances represent actual uses of those definitions.

- **Application Instance:** A running copy of an application.
- **Component Instance:** A specific use of a component definition.
- **Data Instance:** Actual values associated with an application or component.
- **Execution Context:** The state in which logic is evaluated.

Multiple component instances can share a component definition while maintaining independent data.

For example, multiple characters can use the same Health Tracker component without sharing their health values.

This distinction also enables reusable templates, application duplication, and community-created components.

---

## 3. Declarative Application Definitions

Users should define application structures and behaviors through configuration data rather than writing arbitrary application code.

For example, a button could be represented as:

```json
{
  "type": "button",
  "label": "Restore Health",
  "appearance": {
    "color": "green",
    "size": "medium"
  },
  "action": {
    "type": "modify_variable",
    "target": "health.current",
    "operation": "add",
    "value": 5
  }
}
```

The platform interprets this definition and renders the appropriate interface element.

Similarly, users should be able to define custom components by combining:
- Variables.
- Interface elements.
- Formulas.
- Actions.
- Other components.

Definitions should be serializable, versionable, and reusable.

The platform should support an extension mechanism for functionality that cannot be expressed through its standard building blocks.

---

## 4. Formula and Visual Programming Systems

The platform should offer two complementary ways to define application logic.

### Formula Editor

A spreadsheet-inspired expression language.

Example:

```text
(Strength - 10) / 2 + Proficiency
```

More complex expressions should eventually support:
- Conditional expressions.
- Mathematical functions.
- Logical operators.
- Variable references.
- Collection operations.
- Custom functions.

### Visual Programming Editor

A node-based interface where users connect operations to construct logic.

Example workflow:

1. Player clicks a Cast Spell button.
2. Check whether current mana is greater than or equal to 5.
3. If true, subtract 5 mana.
4. Roll damage.
5. Apply damage to an enemy.
6. Update the combat log.
7. Otherwise, display an error message.

Both editors should manipulate the same underlying representation of application logic.

A possible implementation is to parse formulas into Abstract Syntax Trees (ASTs), which can also be represented visually as connected nodes.

The system should support:
- Type checking.
- Validation.
- Dependency tracking.
- Circular dependency detection.
- Controlled execution.
- Execution limits.

**Security:** Never execute arbitrary user-provided JavaScript using `eval()` or unrestricted code execution. Implement a restricted expression language and controlled execution environment.

---

## 5. Database Strategy

### Recommended Database: PostgreSQL

Use PostgreSQL as the primary database, combining relational tables with JSONB for flexible application definitions.

SQL is appropriate for predictable relationships such as:
- Users and workspaces.
- Workspace membership and permissions.
- Applications and their versions.
- Component definitions and instances.
- Application ownership.
- Runtime state and execution history.

JSONB is appropriate for extensible structures such as:
- Component configurations.
- Custom field definitions.
- Layout definitions.
- Formula syntax trees.
- Workflow nodes and connections.
- Custom data structures.

Avoid:
- Creating a separate SQL table for every user-defined component or data type.
- Storing the entire application in one enormous JSON document.
- Using JSONB as a substitute for relational relationships.

### Proposed Database Entities

| Entity | Purpose |
|---|---|
| `users` | User accounts |
| `workspaces` | Shared environments |
| `workspace_members` | Membership and permissions |
| `applications` | Application metadata |
| `application_versions` | Versioned application definitions |
| `application_instances` | Running application instances |
| `component_definitions` | Reusable component blueprints |
| `component_instances` | Specific component uses |
| `data_definitions` | Variable and data type definitions |
| `variable_values` | Runtime variable values |
| `logic_definitions` | Formula and workflow definitions |
| `workflow_nodes` | Individual workflow operations |
| `workflow_connections` | Connections between workflow nodes |
| `execution_history` | Records of executed actions |

This is a conceptual starting point, not a finalized database schema. Some entities may eventually be combined or expanded.

### Versioning

Application definitions should support versioning.

Published versions should be immutable snapshots. Users should be able to:
- Continue using older versions.
- Publish new versions.
- Copy and customize existing applications.
- Migrate instances to newer versions.
- Revert to earlier versions where appropriate.

---

## 6. Proposed Technology Stack

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | Angular | Application builder and runtime |
| Backend | Spring Boot | API, permissions, execution orchestration |
| Database | PostgreSQL | Persistent application data |
| Flexible storage | PostgreSQL JSONB | Custom definitions and configurations |
| Visual editor | Rete.js or similar | Node-based programming |
| Formula engine | Custom Java evaluator | Formula parsing and execution |
| Real-time communication | Spring WebSocket | State synchronization |
| Caching | Redis (optional, later) | Performance and coordination |

The frontend should primarily handle presentation and user interaction.

The backend should remain authoritative for:
- Validating application definitions.
- Evaluating important formulas.
- Executing state-changing workflows.
- Enforcing permissions.
- Persisting changes.

---

## 7. Builder vs. Runtime

The frontend should provide two distinct experiences.

### Application Builder

Where users construct and modify applications.

Features:
- Component library.
- Drag-and-drop layout editor.
- Component configuration panels.
- Variable and data editor.
- Formula editor.
- Visual workflow editor.
- Application preview.
- Save and publish functionality.

### Application Runtime

Where users interact with finished applications.

Features:
- Rendered application interfaces.
- Interactive components.
- Live formula calculations.
- Event execution.
- Shared state.
- Real-time updates.

Both experiences should use the same underlying application definitions and runtime interpretation system.

---

## 8. Extensibility and Future Possibilities

The architecture should eventually support:

- User-created component types.
- Custom data types.
- Custom operations and functions.
- Reusable component libraries.
- Community application templates.
- Application sharing and publishing.
- Third-party extensions and plugins.
- Custom integrations.
- Advanced permission systems.
- Collaborative editing.
- Application import/export.
- Multiple tabletop systems.
- Applications unrelated to tabletop gaming.

The long-term goal is to allow users to build applications with minimal restrictions imposed by the platform itself.

Extensions should eventually operate through a well-defined, sandboxed API rather than unrestricted access to the backend.

---

## 9. Development Roadmap

Development should proceed incrementally, establishing the foundations before introducing advanced functionality.

### Phase 1: Basic Application Runtime

- [ ] User accounts.
- [ ] Create and save applications.
- [ ] Create and delete components.
- [ ] Rearrange components.
- [ ] Basic interface elements.
- [ ] Basic variable types.
- [ ] Persistent storage.

**Goal:** Create a customizable character sheet without hardcoding individual RPG mechanics.

### Phase 2: Data Binding and Formulas

- [ ] User-defined variables.
- [ ] Variable references.
- [ ] Formula parser and evaluator.
- [ ] Automatic recalculation.
- [ ] Dependency tracking.
- [ ] Circular dependency detection.
- [ ] Type validation.

**Goal:** Recreate spreadsheet-style functionality.

### Phase 3: Interaction Engine

- [ ] Custom button actions.
- [ ] Variable modification.
- [ ] Conditional logic.
- [ ] Multi-step workflows.
- [ ] Cross-component interactions.
- [ ] Execution validation and limits.

**Goal:** Allow components to interact with one another through user-defined behavior.

### Phase 4: Visual Programming

- [ ] Node-based editor.
- [ ] Mathematical and logical nodes.
- [ ] Event triggers.
- [ ] Conditional branches.
- [ ] Variable references.
- [ ] Node connections.
- [ ] Formula/visual editor interoperability.

**Goal:** Give users a visual programming environment for building application behavior.

### Phase 5: Collaboration

- [ ] Workspaces and shared applications.
- [ ] User roles and permissions.
- [ ] WebSocket integration.
- [ ] Real-time state synchronization.
- [ ] Concurrent modification handling.
- [ ] Change history.

**Goal:** Allow multiple users to interact with the same application simultaneously.

### Phase 6: Advanced Extensibility

- [ ] Custom component definitions.
- [ ] Nested and reusable components.
- [ ] Custom data types.
- [ ] Application templates.
- [ ] Definition versioning.
- [ ] Import/export.
- [ ] Extension API.
- [ ] Community sharing.

**Goal:** Evolve the platform into a general-purpose application-building environment.

---

## 10. Guiding Architectural Principles

Throughout development, prioritize the following:

1. **Don't hardcode RPG mechanics.** Dice, health, inventory, and other game-specific functionality should be implemented as reusable capabilities rather than assumptions built into the core platform.

2. **Keep data, presentation, and logic separate.** A component's appearance should not dictate how its data is stored or how its behavior is implemented.

3. **Make everything composable.** Components should be reusable and capable of containing other components.

4. **Use declarative definitions.** Applications should be describable as data that the platform interprets.

5. **Build for extensibility early.** New component types, operations, and data types should be addable without redesigning the entire system.

6. **Keep execution safe.** User-defined logic must run within controlled execution limits and respect permissions.

7. **Treat application definitions as versioned artifacts.** Changes to templates should not unexpectedly break existing applications.

8. **Keep the backend authoritative.** Important calculations and state changes should be validated and persisted server-side.

9. **Don't overengineer prematurely.** Design the architecture to accommodate future capabilities, but implement them only when needed.

---

## Overall Goal

Create a platform where users are limited primarily by their own creativity rather than by the assumptions and restrictions of the software.

A user should be able to construct a traditional tabletop character sheet, an elaborate custom resource-management system, or an entirely new game mechanic using the same underlying tools.

The initial application is a TTRPG character sheet. The long-term product is a general-purpose, collaborative, extensible application-building platform.

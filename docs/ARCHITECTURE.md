# Tech Stack
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

 ## Handling type changes
 If the user would change the type of a variable, the change will be allowed and they will be asked how to handle existing values.

 ## Global reference variables
 Formulas can reference any variable in the application by default, regardless of its namespace or the component displaying it.

 ## Separate formula and workflow engines
 Both engines share the application's data model and type system, but serve different purposes:
- Formula engine: calculates values and manages dependencies.
- Workflow engine: executes actions, responds to events, and coordinates multi-step behavior.

We'll also support two ways of creating logic:
1. A traditional editor, where users write formulas or configure workflow steps.
2. A visual node editor, where users connect operations, conditions, and variables.
Importantly, these should be two interfaces for defining the same underlying logic—not two entirely separate execution systems.

## Event-driven automatic workflows
Users can create workflows that execute in response to events, including variable changes, component events, application lifecycle events, and scheduled triggers.
How this might work
Imagine a user defines:
WHEN character.health <= 0
THEN
    character.isAlive = false
    NOTIFY "Character has fallen!"

The workflow engine would:
1. Listen for relevant changes to character.health.
2. Evaluate the trigger condition.
3. Execute the workflow when the condition becomes true.
4. Record the execution and its results.
This is different from a reactive formula: the formula continuously maintains a calculated value, while the workflow responds to an event and performs actions.

Something to consider, risk of cyclic workflow execution
- Record execution history for debugging
- Detect repeated/cyclic workflow execution
- Prevent runaway workflows

These workflows cannot make definition modifications, only runtime modifications.

## Real-time collaboration on application instances
Multiple users can interact with the same running application simultaneously. Changes should synchronize automatically without refreshing.

We'll initially postpone simultaneous editing of application definitions.

The backend is the source of truth for the application state.

## Application instances are pinned to a specific published version
- Publishing a new application version does not automatically update existing instances.
- Instance owners can explicitly migrate to a newer version.
- Instance-specific customizations must be preserved during migration wherever possible.
- Migration should identify conflicts between the new application definition and the instance's customizations before applying changes.

An instance can have two sources of configuration:
- Inherited configuration: The layout, components, and other settings originating from its application version.
- Instance-specific overrides: Changes made by the instance owner that apply only to that instance.

This gives us a useful foundation for handling updates without forcing users to choose between customization and receiving improvements.

## Applications can be published as templates
- Any application owner can choose to publish their application as a reusable template.
- Publishing a template does not surrender ownership of the original application.
- Other users can create independent applications from published templates.
- Those applications can be freely customized without affecting the original or other copies.
- A customized application can itself become a new template.

## Templates maintain lineage and attribution
- A template can identify the template it was derived from.
- The original creator receives attribution.
- Derived templates have their own owners, descriptions, versions, and independent development histories.
- Lineage can be followed through multiple generations of templates.
- Attribution does not imply shared ownership or give the original creator control over derived templates.

## Individual and group ownership
- Every application has an owner.
- Individual users can own applications directly.
- Groups can own applications collectively.
- Individual ownership is the default.
- Group-owned applications can be shared among group members according to their permissions.
- Templates can also be published by individuals or groups.

Ownership and access are not the same thing. For example, I might own an application but invite three friends to use it. They can interact with it without necessarily having permission to change its definition.

Role	        Permissions
Owner	        Full control, including ownership transfer and deletion
Administrator	Manage members, settings, and application definitions
Editor	        Modify application definitions
User	        Use application instances
Viewer	        View without making changes

## Instance-level customization
Users can customize the presentation of their own application instances without modifying the underlying application definition.

Category	            Example
Definition	            Add a field to the Item custom type
Data	                Add a sword to a character's inventory
Runtime	                Equip a sword or trigger an action
Instance configuration	Move the inventory section to the top

## Applications support individual and shared data
- Individual data: Belongs to a particular user within the instance. Other users cannot automatically access or modify it.
- Shared data: Belongs to the application instance and can be accessed by multiple participants according to permissions.

## Individual data is private by default
- Data owned by an individual user is private to that user by default.
- Users can explicitly share individual data with other participants.
- Shared data belongs to the application instance and follows its access permissions.
- Sharing an object does not automatically grant permission to modify it.
- Users can revoke sharing, subject to any application-level rules we establish later.

Data model needs to support permissions at multiple levels: application, instance, collection, and individual object.

## Application-defined data permissions
Application creators can define access rules for individual data elements.

For example:
Data	            Read access     	Write access
Party gold	        Everyone	        Game master
Current quest	    Everyone	        Game master
Character health	Owner, game master	Owner, game master
Secret notes	    Owner only	        Owner only

- Read and write permissions are independent.
- Permissions can be defined at different levels of the data hierarchy.
- Group roles can be used when defining access rules.
- Individual sharing can grant additional access where permitted.
- The backend enforces permissions; hiding a button in Angular is not sufficient security.

## Custom roles and granular permissions
Application creators can:
- Create custom roles with arbitrary names.
- Assign individual permissions to each role.
- Assign multiple roles to a user.
- Modify role permissions independently of the users assigned to them.
- Define permissions for both application-wide actions and specific data or components.

## Three-state permissions
State	Meaning
Allow	Explicitly grants permission
Deny	Explicitly prohibits permission
Inherit	No explicit decision; defer to other applicable rules or the default

## Reusable permission groups are a future enhancement
- The initial permission system will assign individual permissions directly to roles and users.
- Eventually, creators can define reusable permission groups (e.g. Campaign Management, Inventory Administration).
- Permission groups can be assigned to roles to simplify configuration.
- The underlying permission evaluation system should be designed so we can add this without restructuring everything.

## Applications support three editing modes:
- Draft: Changes remain unpublished and don't affect active instances.
- Published: Changes become available through an explicit publishing action.
- Live: Authorized definition changes are immediately applied to opted-in instances.

For Live mode:
- Instances opt in by default.
- Instance owners can opt out.
- Changes are validated before being applied.
- Changes are recorded in an edit history.
- Users receive updates without reloading.
- Structural changes must account for existing data before being applied.

Opting out shouldn't necessarily mean an instance can never receive updates. It simply means it stops automatically receiving them. The owner could still choose to update it manually.

## Initial update mechanism
- Application instances track their definition version.
- Published changes create new versions.
- Instances do not automatically receive updates unless opted into Live mode.
- Owners can manually update instances.
- Changes are recorded in a history.
- Selective automatic updates are deferred to a future enhancement.

## Non-destructive version rollback
- Application creators can restore an earlier version of an application definition.
- Restoring an older version creates a new version rather than deleting or overwriting existing versions.
- Previous versions remain accessible in the version history.
- Existing application instances are not automatically rolled back.
- Owners can independently choose whether to update their instances to the restored version.

## Template ownership and platform moderation are separate
Ownership
- Creators control their own templates.
- Unpublishing or deleting a template doesn't delete existing applications derived from it.
- Derived applications remain independently owned.
- Attribution and lineage are preserved.

Platform moderation
- The platform can remove harmful templates from discovery.
- Distribution of prohibited templates can be blocked.
- Dangerous functionality can be disabled where necessary.
- Existing applications can be flagged, restricted, or disabled when warranted.
- Enforcement decisions belong to the platform, not the original template creator.

User protection
- Moderation should be proportionate to the threat.
- Users should receive explanations when their applications are affected.
- Where appropriate, users should have an opportunity to appeal.
- Moderation should not silently destroy user-created data.

## Structured layouts by default
- Applications use containers, rows, columns, grids, tabs, and similar layout structures.
- Components are arranged within those structures.
- Components can be nested.
- Layouts should adapt to different screen sizes.
- Freeform positioning is deferred as a possible future enhancement.
Containers can themselves be components. That gives us a consistent way to build increasingly complex interfaces.

## Contextual component insertion
- Creators can insert components at specific positions within a layout.
- An insertion menu displays available components.
- Components can be nested inside containers and other composite components.
- A visual component palette can be added later as an alternative.
- Drag-and-drop can be supported where it improves the experience, but isn't required for the initial implementation.

## Hybrid component configuration
- Selecting a component opens a properties sidebar.
- The sidebar provides access to detailed configuration.
- Common properties can also be edited directly on the canvas.
- Inline controls and the sidebar stay synchronized.
- Configuration options depend on the component's type.

## Dedicated application preview mode
- Creators can switch between editing and previewing.
- Preview mode behaves like the actual application runtime.
- Creators can test components, formulas, workflows, and interactions.
- Preview data is isolated from real application instances.
- Creators can return to editing without losing their work.
- Screen-size previews should be supported.
One implementation detail: ideally, Preview mode should use the same rendering and execution engines as the actual application. We don't want bugs appearing only because preview and production behave differently.

## Applications support multiple pages
- An application can contain multiple pages or screens.
- Each page has its own component layout.
- Pages can share the same application-level data model, formulas, and workflows.
- Creators can configure navigation between pages.
- Pages can have visibility and access permissions.
- Applications can define a default landing page.

## Hierarchical page organization
- Pages can contain nested pages.
- Creators can organize pages into intuitive hierarchies.
- Navigation can be generated from that hierarchy.
- Creators can customize how navigation is displayed (sidebar, tabs, menus, etc.).
- We can impose a reasonable nesting limit initially to avoid overly complicated navigation.

One distinction I'd preserve: the hierarchy describes navigation and organization, not necessarily data ownership. A nested page can still access application-wide variables.

## Reusable, data-driven page templates
- Creators can define reusable page templates.
- Page templates can receive data objects as inputs.
- Multiple page instances can use the same template with different data.
- Changes to the page template can update its instances within the application definition.
- Page templates can contain nested components and other reusable page templates.

## Dynamically generated pages
- Pages can be generated from collections of data objects.
- Creators can associate a page template with a collection.
- Creating a new object can automatically create a corresponding page.
- Deleting an object can remove its generated page.
- Updating an object automatically updates the page displaying it.
- Creators can configure how generated pages are named and navigated.

Deleting a page shouldn't necessarily delete the underlying data object, and vice versa. We should distinguish between deleting a generated view and deleting the object itself.

## Dynamically generated components
- Components can be generated from collections of data objects.
- Creators can define a reusable component template for each collection item.
- Each generated component receives the corresponding object as its data context.
- Adding or removing collection items automatically updates the rendered components.
- Changes to an object automatically update its corresponding component.

## Conditional visibility
Creators can configure components and pages to appear or disappear based on conditions.

Conditions can reference:
- Application data and variables.
- Formula results.
- User roles and permissions.
- Collection contents.
- Other runtime state.

Clarifications:
- Hiding something is not the same as restricting access. Permissions must still be enforced by the backend.
- Conditions should update reactively when their dependencies change.
- The same visibility system should work for both pages and components.

## Conditional behavior
Components can change their behavior or appearance based on conditions, much like with conditional visibility.

Examples:
- A health indicator changes color as health decreases.
- A button becomes disabled when a character lacks sufficient resources.
- An inventory item displays differently when equipped.
- A field becomes read-only after a character is finalized.
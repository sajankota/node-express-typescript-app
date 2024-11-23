// src/constants/accessibilityMetricsConstants.ts

export const accessibilityMetricsConstants = [
    {
        id: "accesskeys",
        name: "Accesskeys",
        positiveText: "No accesskeys were found, ensuring a conflict-free navigation experience.",
        negativeText: "Accesskeys were found, which may cause navigation conflicts for users.",
        tooltip: "Accesskeys provide shortcuts for navigation but can conflict with assistive technologies.",
    },
    {
        id: "aria-allowed-attr",
        name: "ARIA Allowed Attribute",
        positiveText: "All ARIA attributes used are allowed for their roles.",
        negativeText: "Some ARIA attributes are not allowed for their roles, which can lead to confusion for assistive technologies.",
        tooltip: "Ensures only ARIA attributes permitted for each role are used.",
    },
    {
        id: "aria-allowed-role",
        name: "ARIA Allowed Role",
        positiveText: "All roles used are valid and appropriate.",
        negativeText: "Some elements use roles that are not allowed, leading to accessibility issues.",
        tooltip: "Checks if elements have roles allowed for the context in which they are used.",
    },
    {
        id: "aria-command-name",
        name: "ARIA Command Name",
        positiveText: "All ARIA commands are appropriately named.",
        negativeText: "Some ARIA commands are missing a name, which can cause confusion.",
        tooltip: "Ensures ARIA commands are clearly and appropriately named for users.",
    },
    {
        id: "aria-conditional-attr",
        name: "ARIA Conditional Attribute",
        positiveText: "ARIA attributes conditionally required are used correctly.",
        negativeText: "Some ARIA attributes required in certain conditions are not used correctly.",
        tooltip: "Ensures that ARIA attributes conditionally required for certain roles are present.",
    },
    {
        id: "aria-deprecated-role",
        name: "ARIA Deprecated Role",
        positiveText: "No deprecated ARIA roles were used.",
        negativeText: "Some deprecated ARIA roles were used, which may negatively impact accessibility.",
        tooltip: "Checks if deprecated ARIA roles are used, as these may not be well supported.",
    },
    {
        id: "aria-dialog-name",
        name: "ARIA Dialog Name",
        positiveText: "All dialog elements are properly named.",
        negativeText: "Some dialog elements are missing a name, reducing accessibility.",
        tooltip: "Ensures that all ARIA dialogs have an appropriate name for assistive technologies.",
    },
    {
        id: "aria-hidden-body",
        name: "ARIA Hidden Body",
        positiveText: "ARIA 'hidden' attribute is correctly applied to body elements.",
        negativeText: "ARIA 'hidden' attribute is incorrectly applied to body elements, which could obscure important content.",
        tooltip: "Verifies that the ARIA 'hidden' attribute is not applied to elements that should be visible.",
    },
    {
        id: "aria-hidden-focus",
        name: "ARIA Hidden Focus",
        positiveText: "No focusable elements are hidden with ARIA.",
        negativeText: "Some focusable elements are hidden using ARIA, which may confuse users.",
        tooltip: "Checks if focusable elements are hidden incorrectly with ARIA attributes.",
    },
    {
        id: "aria-input-field-name",
        name: "ARIA Input Field Name",
        positiveText: "All ARIA input fields have a valid name.",
        negativeText: "Some ARIA input fields are missing a name, affecting accessibility.",
        tooltip: "Ensures all ARIA input fields are properly named.",
    },
    {
        id: "aria-meter-name",
        name: "ARIA Meter Name",
        positiveText: "All ARIA meters are named appropriately.",
        negativeText: "Some ARIA meters are missing a name, making them inaccessible.",
        tooltip: "Checks if ARIA meters have valid and descriptive names.",
    },
    {
        id: "aria-progressbar-name",
        name: "ARIA Progressbar Name",
        positiveText: "All progress bars have a valid ARIA name.",
        negativeText: "Some progress bars lack a name, making it difficult for assistive technologies to identify them.",
        tooltip: "Ensures ARIA progress bars have valid names to be recognizable by users.",
    },
    {
        id: "aria-prohibited-attr",
        name: "ARIA Prohibited Attribute",
        positiveText: "No prohibited ARIA attributes were used.",
        negativeText: "Some prohibited ARIA attributes were used, which can cause accessibility issues.",
        tooltip: "Checks if prohibited ARIA attributes are being used.",
    },
    {
        id: "aria-required-attr",
        name: "ARIA Required Attribute",
        positiveText: "All required ARIA attributes are properly applied.",
        negativeText: "Some ARIA attributes required for certain roles are missing.",
        tooltip: "Ensures all required ARIA attributes for specific roles are present.",
    },
    {
        id: "aria-required-children",
        name: "ARIA Required Children",
        positiveText: "All ARIA elements contain the required child elements.",
        negativeText: "Some ARIA elements are missing required child elements.",
        tooltip: "Checks if ARIA elements contain the correct child elements.",
    },
    {
        id: "aria-required-parent",
        name: "ARIA Required Parent",
        positiveText: "All ARIA elements have a valid parent element.",
        negativeText: "Some ARIA elements are missing the required parent element.",
        tooltip: "Ensures ARIA elements are used within appropriate parent elements.",
    },
    {
        id: "aria-roles",
        name: "ARIA Roles",
        positiveText: "All ARIA roles are correctly applied.",
        negativeText: "Some ARIA roles are used incorrectly, affecting accessibility.",
        tooltip: "Checks if ARIA roles are properly applied.",
    },
    {
        id: "aria-text",
        name: "ARIA Text",
        positiveText: "All ARIA text elements are appropriately labeled.",
        negativeText: "Some ARIA text elements lack appropriate labels.",
        tooltip: "Ensures that ARIA text elements are properly named for accessibility.",
    },
    {
        id: "aria-toggle-field-name",
        name: "ARIA Toggle Field Name",
        positiveText: "All ARIA toggle fields are properly named.",
        negativeText: "Some ARIA toggle fields are missing names, reducing usability.",
        tooltip: "Checks if ARIA toggle fields have appropriate names.",
    },
    {
        id: "aria-tooltip-name",
        name: "ARIA Tooltip Name",
        positiveText: "All ARIA tooltips are properly named.",
        negativeText: "Some ARIA tooltips are missing names, impacting accessibility.",
        tooltip: "Ensures that ARIA tooltips have descriptive and appropriate names.",
    },
    {
        id: "aria-treeitem-name",
        name: "ARIA Treeitem Name",
        positiveText: "All ARIA tree items have appropriate names.",
        negativeText: "Some ARIA tree items are missing names, making them difficult for users to identify.",
        tooltip: "Checks if ARIA tree items are named properly for accessibility.",
    },
    {
        id: "aria-valid-attr-value",
        name: "ARIA Valid Attribute Value",
        positiveText: "All ARIA attribute values are valid.",
        negativeText: "Some ARIA attributes have invalid values, affecting user experience.",
        tooltip: "Ensures that ARIA attribute values are valid and meaningful.",
    },
    {
        id: "aria-valid-attr",
        name: "ARIA Valid Attribute",
        positiveText: "All ARIA attributes are valid.",
        negativeText: "Some ARIA attributes are not valid, which can affect accessibility.",
        tooltip: "Checks if the ARIA attributes used are valid.",
    },
    {
        id: "button-name",
        name: "Button Name",
        positiveText: "All buttons are clearly labeled with accessible names.",
        negativeText: "Some buttons are missing accessible names, making them difficult to use.",
        tooltip: "Ensures that all buttons have names that describe their function.",
    },
    {
        id: "bypass",
        name: "Bypass Blocks",
        positiveText: "Page has a mechanism to bypass blocks of content.",
        negativeText: "Page lacks a way to bypass repetitive blocks of content.",
        tooltip: "Ensures users can bypass blocks of content to reach main sections quickly.",
    },
    {
        id: "color-contrast",
        name: "Color Contrast",
        positiveText: "All text and interactive elements meet the recommended contrast ratio.",
        negativeText: "Some text or interactive elements have low contrast, making them difficult to read.",
        tooltip: "Ensures text and interactive elements have sufficient color contrast to be readable by users.",
    },
    {
        id: "definition-list",
        name: "Definition List",
        positiveText: "Your definition list structure follows accessibility guidelines.",
        negativeText: "Your definition list structure is not well-formed, impacting accessibility.",
        tooltip: "Definition List ensures proper usage of <dl>, <dt>, and <dd> tags for clear semantic meaning."
    },
    {
        id: "dlitem",
        name: "Definition List Item",
        positiveText: "All definition list items are correctly labeled.",
        negativeText: "Some definition list items are not labeled properly, which may confuse screen readers.",
        tooltip: "Definition List Item checks if <dd> tags are correctly paired with corresponding <dt> tags."
    },
    {
        id: "document-title",
        name: "Document Title",
        positiveText: "Your page has a meaningful document title, improving discoverability and user understanding.",
        negativeText: "Your page lacks a proper document title, making it harder for users to understand page content.",
        tooltip: "Document Title ensures that every page has a descriptive title element, which is crucial for usability."
    },
    {
        id: "duplicate-id-aria",
        name: "Duplicate ID ARIA",
        positiveText: "There are no duplicate ARIA IDs, ensuring accessibility tools can properly interpret your page.",
        negativeText: "Duplicate ARIA IDs detected, which may cause confusion for accessibility tools.",
        tooltip: "Duplicate ID ARIA checks for unique ARIA identifiers to ensure elements are correctly referenced."
    },
    {
        id: "form-field-multiple-labels",
        name: "Form Field Multiple Labels",
        positiveText: "Form fields have appropriate labels, providing a good user experience.",
        negativeText: "Some form fields have multiple labels, which can confuse users and assistive technology.",
        tooltip: "Form Field Multiple Labels identifies form fields that have more than one associated label."
    },
    {
        id: "frame-title",
        name: "Frame Title",
        positiveText: "All iframe elements have titles that describe their content.",
        negativeText: "Some iframe elements are missing titles, which affects screen reader navigation.",
        tooltip: "Frame Title checks that all iframes include a descriptive title attribute."
    },
    {
        id: "heading-order",
        name: "Heading Order",
        positiveText: "Headings are in a logical order, making content structure clear.",
        negativeText: "Headings are not in a logical order, which can confuse users and impair navigation.",
        tooltip: "Heading Order ensures that headings follow a logical hierarchical order."
    },
    {
        id: "html-has-lang",
        name: "HTML Has Language",
        positiveText: "The page language is defined, improving accessibility for screen readers.",
        negativeText: "The page does not define a language, making it harder for screen readers to interpret the content.",
        tooltip: "HTML Has Language checks if a language is declared in the HTML element."
    },
    {
        id: "html-lang-valid",
        name: "HTML Language Valid",
        positiveText: "The declared language attribute is valid.",
        negativeText: "The declared language attribute is invalid, impacting screen reader behavior.",
        tooltip: "HTML Language Valid verifies if the declared language attribute is correct and recognized."
    },
    {
        id: "html-xml-lang-mismatch",
        name: "HTML XML Language Mismatch",
        positiveText: "The language attributes in HTML and XML are consistent.",
        negativeText: "The language attributes in HTML and XML are inconsistent, causing confusion for assistive technologies.",
        tooltip: "HTML XML Language Mismatch checks that both HTML and XML language attributes match."
    },
    {
        id: "image-alt",
        name: "Image Alt",
        positiveText: "All images have appropriate alt text, providing context for visually impaired users.",
        negativeText: "Some images are missing alt text, making it difficult for visually impaired users to understand the content.",
        tooltip: "Image Alt checks that all images have descriptive alt attributes for accessibility."
    },
    {
        id: "image-redundant-alt",
        name: "Redundant Image Alt",
        positiveText: "No redundant alt text found, ensuring concise and useful descriptions.",
        negativeText: "Redundant alt text detected, which may confuse users relying on screen readers.",
        tooltip: "Redundant Image Alt ensures that alt text does not repeat surrounding content unnecessarily."
    },
    {
        id: "input-button-name",
        name: "Input Button Name",
        positiveText: "All input buttons have accessible names.",
        negativeText: "Some input buttons are missing accessible names, which affects usability for assistive technologies.",
        tooltip: "Input Button Name checks that all input buttons have meaningful names for accessibility."
    },
    {
        id: "input-image-alt",
        name: "Input Image Alt",
        positiveText: "All input images have alt attributes that describe their purpose.",
        negativeText: "Some input images are missing alt attributes, making it difficult for users to understand their function.",
        tooltip: "Input Image Alt checks that all input images have appropriate alt text."
    },
    {
        id: "label",
        name: "Label",
        positiveText: "All form elements have associated labels, improving usability.",
        negativeText: "Some form elements are missing labels, which can confuse users.",
        tooltip: "Label ensures that form elements are properly labeled for accessibility."
    },
    {
        id: "link-in-text-block",
        name: "Link in Text Block",
        positiveText: "Links are distinguishable in text blocks, enhancing readability.",
        negativeText: "Links are not distinguishable from surrounding text, making it harder for users to navigate.",
        tooltip: "Link in Text Block checks that links stand out from regular text, ensuring easy navigation."
    },
    {
        id: "link-name",
        name: "Link Name",
        positiveText: "All links have descriptive names that indicate their purpose.",
        negativeText: "Some links are missing descriptive names, which may confuse users.",
        tooltip: "Link Name ensures that links are named clearly to convey their destination or action."
    },
    {
        id: "list",
        name: "List",
        positiveText: "Lists are properly structured, providing clear navigation for users.",
        negativeText: "Some lists are not correctly marked up, making it difficult for users to understand the content.",
        tooltip: "List ensures that <ul>, <ol>, and <li> elements are used correctly for accessibility."
    },
    {
        id: "listitem",
        name: "List Item",
        positiveText: "All list items are correctly associated with their lists.",
        negativeText: "Some list items are not properly nested, impacting list comprehension.",
        tooltip: "List Item checks that list items are properly nested within their respective lists."
    },
    {
        id: "meta-refresh",
        name: "Meta Refresh",
        positiveText: "No meta refresh tags detected, ensuring better user control.",
        negativeText: "Meta refresh tags detected, which may lead to poor user experience.",
        tooltip: "Meta Refresh checks for meta refresh tags that can cause unexpected page redirects."
    },
    {
        id: "meta-viewport",
        name: "Meta Viewport",
        positiveText: "The page has a valid meta viewport tag, ensuring good responsiveness.",
        negativeText: "The page is missing a meta viewport tag, which may affect mobile usability.",
        tooltip: "Meta Viewport checks if the viewport meta tag is present to improve mobile experience."
    },
    {
        id: "object-alt",
        name: "Object Alt",
        positiveText: "All object elements have fallback text.",
        negativeText: "Some object elements are missing fallback text, affecting accessibility.",
        tooltip: "Object Alt checks that <object> elements provide alternative content for accessibility."
    },
    {
        id: "select-name",
        name: "Select Name",
        positiveText: "All select elements have descriptive names.",
        negativeText: "Some select elements are missing names, which may confuse users.",
        tooltip: "Select Name ensures that select elements have appropriate labels for accessibility."
    },
    {
        id: "skip-link",
        name: "Skip Link",
        positiveText: "Skip links are present, allowing users to bypass repetitive content.",
        negativeText: "No skip links found, which may make navigation difficult for keyboard users.",
        tooltip: "Skip Link checks for links that allow users to skip directly to the main content."
    },
    {
        id: "tabindex",
        name: "Tabindex",
        positiveText: "The tabindex attribute is used appropriately, maintaining logical focus order.",
        negativeText: "Incorrect use of tabindex detected, which may affect keyboard navigation.",
        tooltip: "Tabindex checks that the tabindex attribute is used to create an accessible focus order."
    },
    {
        id: "table-duplicate-name",
        name: "Table Duplicate Name",
        positiveText: "No duplicate table names detected, ensuring clarity.",
        negativeText: "Duplicate table names detected, which may confuse screen reader users.",
        tooltip: "Table Duplicate Name checks that tables have unique, descriptive names."
    },
    {
        id: "target-size",
        name: "Target Size",
        positiveText: "Interactive elements have an appropriate size, improving usability.",
        negativeText: "Some interactive elements are too small, making them difficult to activate.",
        tooltip: "Target Size checks that interactive elements are large enough for easy activation."
    },
    {
        id: "td-headers-attr",
        name: "Table Headers Attribute",
        positiveText: "Table data cells are properly associated with headers.",
        negativeText: "Some table data cells are not associated with headers, affecting comprehension.",
        tooltip: "Table Headers Attribute ensures that <td> elements are correctly associated with <th> elements for accessibility."
    },
    {
        id: "th-has-data-cells",
        name: "Table Header Data Cells",
        positiveText: "All table headers have associated data cells, improving table comprehension.",
        negativeText: "Some table headers are missing associated data cells, impacting accessibility.",
        tooltip: "Table Header Data Cells checks that <th> elements are properly associated with <td> elements."
    },
    {
        id: "valid-lang",
        name: "Valid Language",
        positiveText: "The page has a valid language attribute, enhancing accessibility.",
        negativeText: "Invalid language attribute detected, which may confuse assistive technologies.",
        tooltip: "Valid Language ensures that the declared language attribute is correct and recognized."
    },
    {
        id: "video-caption",
        name: "Video Caption",
        positiveText: "All videos have captions, making them accessible to users with hearing impairments.",
        negativeText: "Some videos are missing captions, which affects accessibility for hearing-impaired users.",
        tooltip: "Video Caption checks that all video elements provide captions for accessibility."
    },
    {
        id: "focusable-controls",
        name: "Focusable Controls",
        positiveText: "All interactive controls can be focused, improving accessibility.",
        negativeText: "Some interactive controls cannot be focused, which impairs keyboard navigation.",
        tooltip: "Focusable Controls checks that all interactive elements are focusable for users navigating with a keyboard."
    },
    {
        id: "interactive-element-affordance",
        name: "Interactive Element Affordance",
        positiveText: "All interactive elements have affordances that indicate their functionality.",
        negativeText: "Some interactive elements lack affordances, making them difficult for users to identify their purpose.",
        tooltip: "Interactive Element Affordance checks that all interactive elements visually indicate their functionality, ensuring a better user experience."
    },
    {
        id: "logical-tab-order",
        name: "Logical Tab Order",
        positiveText: "The tab order of the elements is logical, making navigation easy for keyboard users.",
        negativeText: "The tab order of some elements is not logical, which may confuse users navigating with a keyboard.",
        tooltip: "Logical Tab Order ensures that the order in which users navigate using the tab key makes logical sense for accessibility."
    },
    {
        id: "visual-order-follows-dom",
        name: "Visual Order Follows DOM",
        positiveText: "The visual order of content matches the DOM order, improving consistency for all users.",
        negativeText: "The visual order does not follow the DOM order, which can confuse users, especially those using assistive technologies.",
        tooltip: "Visual Order Follows DOM checks if the order of elements on the screen is consistent with their order in the DOM."
    },
    {
        id: "focus-traps",
        name: "Focus Traps",
        positiveText: "No focus traps detected, ensuring users can freely navigate through the page.",
        negativeText: "Focus traps detected, which can prevent users from navigating away from a particular element.",
        tooltip: "Focus Traps checks that users can move focus out of all interactive elements using standard navigation keys."
    },
    {
        id: "managed-focus",
        name: "Managed Focus",
        positiveText: "Focus is managed effectively during page changes, enhancing the user experience.",
        negativeText: "Focus is not properly managed during page changes, making it harder for users to understand changes in context.",
        tooltip: "Managed Focus ensures that focus is moved appropriately during content changes to improve usability."
    },
    {
        id: "use-landmarks",
        name: "Use of Landmarks",
        positiveText: "Landmarks are used effectively to improve navigation for screen reader users.",
        negativeText: "No landmarks detected, which may make navigation more challenging for screen reader users.",
        tooltip: "Use of Landmarks checks that ARIA landmarks are used to define regions of the page, aiding navigation for assistive technology users."
    },
    {
        id: "offscreen-content-hidden",
        name: "Offscreen Content Hidden",
        positiveText: "Offscreen content is hidden from assistive technologies, ensuring users do not encounter irrelevant elements.",
        negativeText: "Some offscreen content is not hidden, which may confuse users of assistive technologies.",
        tooltip: "Offscreen Content Hidden checks that offscreen elements are properly hidden from screen readers to avoid confusion."
    },
    {
        id: "custom-controls-labels",
        name: "Custom Controls Labels",
        positiveText: "All custom controls have appropriate labels, ensuring usability.",
        negativeText: "Some custom controls lack appropriate labels, making them difficult to understand for users.",
        tooltip: "Custom Controls Labels checks that custom controls have labels that convey their purpose effectively."
    },
    {
        id: "custom-controls-roles",
        name: "Custom Controls Roles",
        positiveText: "Custom controls have appropriate ARIA roles, making them accessible.",
        negativeText: "Some custom controls are missing ARIA roles, which affects their accessibility.",
        tooltip: "Custom Controls Roles checks that custom elements have appropriate ARIA roles to ensure they are accessible."
    },
    {
        id: "empty-heading",
        name: "Empty Heading",
        positiveText: "No empty headings detected, ensuring proper content structure.",
        negativeText: "Empty headings detected, which may confuse users and impact accessibility.",
        tooltip: "Empty Heading checks for heading tags that contain no content, which can confuse users navigating the page."
    },
    {
        id: "identical-links-same-purpose",
        name: "Identical Links Same Purpose",
        positiveText: "Links with the same purpose have identical text, improving consistency.",
        negativeText: "Links with the same purpose have different text, which may confuse users.",
        tooltip: "Identical Links Same Purpose ensures that links leading to the same destination have consistent link text."
    },
    {
        id: "landmark-one-main",
        name: "Landmark One Main",
        positiveText: "A single main landmark is defined, providing clear page structure for screen reader users.",
        negativeText: "More than one main landmark detected, which can confuse users of assistive technologies.",
        tooltip: "Landmark One Main checks that only one <main> landmark is present to ensure a clear page structure."
    },
    {
        id: "label-content-name-mismatch",
        name: "Label Content Name Mismatch",
        positiveText: "All labels match their associated content, improving accessibility.",
        negativeText: "Some labels do not match their associated content, which may confuse users.",
        tooltip: "Label Content Name Mismatch ensures that the visible label text matches the programmatic name for accessibility."
    },
    {
        id: "table-fake-caption",
        name: "Table Fake Caption",
        positiveText: "All tables have properly defined captions.",
        negativeText: "Some tables have captions implemented incorrectly, which affects readability for screen reader users.",
        tooltip: "Table Fake Caption checks that table captions are properly implemented using the <caption> tag."
    },
    {
        id: "td-has-header",
        name: "Table Data Has Header",
        positiveText: "All table data cells are associated with headers, ensuring a clear relationship.",
        negativeText: "Some table data cells are missing headers, which impacts table comprehension for assistive technology users.",
        tooltip: "Table Data Has Header checks that <td> elements are correctly associated with <th> elements for accessibility."
    }

];

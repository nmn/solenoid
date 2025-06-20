# solenoid

Experimental "resumable" framework that encodes signal graphs in HTML

## Benefits

- Small runtime provided by the framework (under 10Kb gzipped)
- No client bundles from application code
  - Only small serialized functions for event handlers and data transformations loaded as needed
- No Hydration
  - No Hydration Errors
  - HTML is the source of truth
  - Application is interactive immediately. Even before the initial HTML is done streaming in.
  - HTML becomes "active" as it streams in and "catches up" to client state
- No "double data"
  - The HTML contains the entire application
  - No separate data streamed after the HTML
  - No "templates" or "components" are sent to the client
  - The application data dependency graph is encoded in the HTML itself
- Signals based framework for fast updates

## Trade-offs

- Larger HTML markup than other frameworks
- Framework-inserted wrapper and sibling elements makes certain CSS selectors unreliable
  - You should not use any selector that depends on direct children or adjacent sibling
    - Descendent selectors and arbitrary sibling selectors are OK.
    - We might create a PostCSS (or LightningCSS) plugin later to fix this limitation
- The framework can exhibit "tearing" if you interact during initial page streaming

## Other design decisions that may change

- The framework uses a handful of custom elements to define custom behaviour for HTML
  - But we also need to depend on a `MutationObserver` to wait for closing tags
  - It might make sense to remove custom elements in the future
- Today the framework uses long, descriptive names for various APIs and implementation details
  - This is for readability during this early stage of development
  - The naming may be adjusted if Solenoid ever starts to become production-ready

## TODO

- [ ] A generic Context Provider
- [ ] A generic Context Consumer
- [ ] Proper support for async components and data fetching on the server (in progress)
- [ ] Support for "deferred" branches of UI
- [ ] Support for "remote" components that update after a server round-trip
- [ ] Build-time extraction for all functions so they can be loaded ad-hoc rather than inlined in script tags
- [ ] Support for client-side routing by leveraging `morphdom`


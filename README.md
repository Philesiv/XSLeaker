# XSLeaker
XSLeaker is a tool that helps to find [XS-Leaks](https://xsleaks.dev/) on websites. The tool compares resource values for that a leak technique is known (e.g. number of iframes) between different states.

XSLeaker consists of two components, a chrome extension that is used to gather the resource values in different states and a node.js server that is used to compare and display the results.



## Setup
Assuming the user want to test *n* different states the following setup must be done:

1. [Build the browser extension](extension/README.md)  
   
2. Create *n* Chrome profiles, one for each state. As the profiles can be reused, the user only has to create new Chrome profiles if more than *n*  states should be tested.
3. Install the XSLeaker Chrome extension for each profile.

This setup must be done only once, except if the user needs more profiles as they want to test more states.

## How to use it
1. [Run the node.js server](server/README.md)

2. Open $n$ browser windows with different profiles.
   
3. Activate the browser extension in each window. This is done with the ``Activate'' button in the popup (see \autoref{fig:popup}). Optionally the user can choose a state name.
    
4. Setup the different states for the website that should be tested, one for each window(e.\,g., logging in as different users).
    
5. Choose one window and activate the \textit{Master Mode} (see \autoref{sec:masterMode}) through the switch in the popup window. The other windows now follow URL changes from the master window.

6. Within the master window, navigate to the site that should be tested. Every other window navigates to the same page.
   
7. Start testing the \gls{xslr} values with a click on the ``Send Results'' button in the popup of the master window.
   
8. Navigate to the web interface provided by Node.js to check for differences.
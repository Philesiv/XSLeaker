# XSLeaker
XSLeaker is a tool that helps to find [XS-Leaks](https://xsleaks.dev/) on websites. The tool compares resource values for that a leak technique is known (e.g. number of iframes) between different states.

XSLeaker consists of two components, a chrome extension that is used to gather the resource values in different states and a node.js server that is used to compare and display the results.



## Setup
1. [Build the browser extension](extension/README.md)  
1. Create $n$ Chrome profiles, one for each state. As the profiles can be reused, the user only has to create new Chrome profiles if more than $n$ states should be tested. 
2. Install the XSLeaker Chrome extension for each profile.

This setup must be done only once, except if the user needs more profiles. 

## Usage

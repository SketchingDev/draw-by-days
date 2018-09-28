# Image Library


## Problems

This project experiences the bug ['Possible type definition conflict on @types/chai'](https://github.com/cypress-io/cypress/issues/1087).
It can be resolved by including the `skipLibCheck` flag in tsconfig as suggested in the GitHub issue.
```
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```
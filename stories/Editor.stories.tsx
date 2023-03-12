import React from 'react';
import { Meta, Story } from '@storybook/react';
import Editor, { EditorProps } from '../src/editor';
import { SupportLanguage } from '../src/types/monaco';

const meta: Meta = {
  title: 'Editor',
  component: Editor,
};

export default meta;

const Template: Story<EditorProps> = args => (
  <Editor {...args} />
);

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const MultiFile = Template.bind({});

MultiFile.args = {
  modelInfos: [
    {
      filename: 'a.sol',
      value: 'pragma solidity ^0.8.0;\ncontract MyContract {\n     function foo() external {\n         // do something\n     }\n}\n',
      language: SupportLanguage.Solidity,
    }
  ],
};

export const MultiLanguage = Template.bind({});

MultiLanguage.args = {
  id: '1',
  modelInfos: [
    {
      filename: 'a.sol',
      value: 'pragma solidity ^0.8.0;\nimport "b.sol";\ncontract MyContract {\n     function foo() external {\n         // do something\n     }\n}\n',
      language: SupportLanguage.Solidity,
    },
    {
      filename: 'b.sol',
      value: 'pragma solidity ^0.8.0;\nimport "a.sol";\ncontract MyContract {\n     function foo() external {\n         // do something\n     }\n}\n',
      language: SupportLanguage.Solidity,
    }
  ],
};

// export const ReadOnly = Template.bind({});

// ReadOnly.args = {
//   id: '2',
//   modelsInfo: [
//     {
//       readOnly: true,
//       filename: 'ReadOnly.js',
//       value: 'console.log("Read only")',
//       language: 'javascript',
//     },
//   ],
// };




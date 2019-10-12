import * as React from 'react';

import { TreeSelect } from 'antd';

const { TreeNode } = TreeSelect;

class Treeselect extends React.Component {
    public state = {
    value: undefined,
  };

  public onChange = (value:any) => {
    console.log(value);
    this.setState({ value });
  };

  public render() {
    return (
        <div>
             <TreeSelect
        showSearch={true}
        style={{ width: 300 }}
        value={this.state.value}
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        placeholder="Please select"
        allowClear={true}
        treeDefaultExpandAll={true}
        onChange={this.onChange}
      >
        <TreeNode value="parent 1" title="parent 1" key="0-1">
          <TreeNode value="parent 1-0" title="parent 1-0" key="0-1-1">
            <TreeNode value="leaf1" title="my leaf" key="random" />
            <TreeNode value="leaf2" title="your leaf" key="random1" />
          </TreeNode>
          <TreeNode value="parent 1-1" title="parent 1-1" key="random2">
            <TreeNode value="sss" title={<b style={{ color: '#08c' }}>sss</b>} key="random3" />
          </TreeNode>
        </TreeNode>
      </TreeSelect>
        </div>
     
    );
  }
}

export default Treeselect;
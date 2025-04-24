export function parseToolUse(content, mcpTools) {
    if (!content || !mcpTools || mcpTools.length === 0) {
      return []
    }
    const toolUsePattern =
      /<tool_use>([\s\S]*?)<name>([\s\S]*?)<\/name>([\s\S]*?)<arguments>([\s\S]*?)<\/arguments>([\s\S]*?)<\/tool_use>/g
    const tools = []
    let match
    let idx = 0
    // Find all tool use blocks
    while ((match = toolUsePattern.exec(content)) !== null) {
      // const fullMatch = match[0]
      const toolName = match[2].trim()
      const toolArgs = match[4].trim()
  
      // Try to parse the arguments as JSON
      let parsedArgs
      try {
        parsedArgs = JSON.parse(toolArgs)
      } catch (error) {
        // If parsing fails, use the string as is
        parsedArgs = toolArgs
      }
      // console.log(`Parsed arguments for tool "${toolName}":`, parsedArgs)
      const mcpTool = mcpTools.find((tool) => tool.name === toolName)
      if (!mcpTool) {
        console.error(`Tool "${toolName}" not found in MCP tools`)
        continue
      }
  
      // Add to tools array
      tools.push({
        id: `${toolName}-${idx++}`, // Unique ID for each tool use
        tool: {
          ...mcpTool,
          inputSchema: parsedArgs
        },
        status: 'pending'
      })
  
      // Remove the tool use block from the content
      // content = content.replace(fullMatch, '')
    }
    return tools
  }
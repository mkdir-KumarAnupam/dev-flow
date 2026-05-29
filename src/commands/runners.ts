export function generateCppWrapper(code: string, testcases: string[], metaData: any) {
  let paramParsing = '';
  let argsList: string[] = [];
  
  metaData.params.forEach((param: any, idx: number) => {
    let cppType = 'int';
    let getFunc = 'get<int>()';
    if (param.type === 'integer') { cppType = 'int'; getFunc = 'get<int>()'; }
    else if (param.type === 'long') { cppType = 'long long'; getFunc = 'get<long long>()'; }
    else if (param.type === 'double') { cppType = 'double'; getFunc = 'get<double>()'; }
    else if (param.type === 'string') { cppType = 'std::string'; getFunc = 'get<std::string>()'; }
    else if (param.type === 'boolean') { cppType = 'bool'; getFunc = 'get<bool>()'; }
    else if (param.type === 'character') { cppType = 'char'; getFunc = 'get<std::string>()[0]'; }
    else if (param.type === 'integer[]') { cppType = 'std::vector<int>'; getFunc = 'get<std::vector<int>>()'; }
    else if (param.type === 'string[]') { cppType = 'std::vector<std::string>'; getFunc = 'get<std::vector<std::string>>()'; }
    else if (param.type === 'integer[][]') { cppType = 'std::vector<std::vector<int>>'; getFunc = 'get<std::vector<std::vector<int>>>()'; }
    
    paramParsing += `      ${cppType} arg${idx} = inputs[${idx}].${getFunc};\n`;
    argsList.push(`arg${idx}`);
  });

  const wrapper = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include "json.hpp"
using json = nlohmann::json;
using namespace std;

${code}

std::vector<std::string> splitLines(const std::string& str) {
    std::vector<std::string> tokens;
    std::string token;
    std::istringstream tokenStream(str);
    while (std::getline(tokenStream, token, '\\n')) {
        tokens.push_back(token);
    }
    return tokens;
}

int main(int argc, char* argv[]) {
    if (argc < 2) return 1;
    json testcases = json::parse(argv[1]);
    json results = json::array();
    
    Solution sol;
    for (auto& tc : testcases) {
        try {
            std::string tcStr = tc.get<std::string>();
            std::vector<std::string> lines = splitLines(tcStr);
            json inputs = json::array();
            for (const auto& l : lines) {
                if(l.empty()) continue;
                inputs.push_back(json::parse(l));
            }
            
${paramParsing}
            
            auto res = sol.${metaData.name}(${argsList.join(', ')});
            results.push_back(res);
        } catch (const std::exception& e) {
            results.push_back({{"error", e.what()}});
        }
    }
    std::cout << results.dump() << std::endl;
    return 0;
}
`;
  return wrapper;
}

export function generateJavaWrapper(code: string, testcases: string[], metaData: any) {
  let paramParsing = '';
  let argsList: string[] = [];
  
  metaData.params.forEach((param: any, idx: number) => {
    let javaType = 'int';
    let typeClass = 'Integer.class';
    if (param.type === 'integer') { javaType = 'int'; typeClass = 'int.class'; }
    else if (param.type === 'long') { javaType = 'long'; typeClass = 'long.class'; }
    else if (param.type === 'double') { javaType = 'double'; typeClass = 'double.class'; }
    else if (param.type === 'string') { javaType = 'String'; typeClass = 'String.class'; }
    else if (param.type === 'boolean') { javaType = 'boolean'; typeClass = 'boolean.class'; }
    else if (param.type === 'character') { javaType = 'char'; typeClass = 'char.class'; }
    else if (param.type === 'integer[]') { javaType = 'int[]'; typeClass = 'int[].class'; }
    else if (param.type === 'string[]') { javaType = 'String[]'; typeClass = 'String[].class'; }
    else if (param.type === 'integer[][]') { javaType = 'int[][]'; typeClass = 'int[][].class'; }
    
    paramParsing += `      ${javaType} arg${idx} = gson.fromJson(lines[${idx}], ${typeClass});\n`;
    argsList.push(`arg${idx}`);
  });

  const wrapper = `
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.google.gson.JsonObject;
import java.util.*;

${code.replace(/public class Solution/, 'class Solution')}

public class Main {
    public static void main(String[] args) {
        if (args.length < 1) return;
        Gson gson = new Gson();
        JsonArray testcases = JsonParser.parseString(args[0]).getAsJsonArray();
        JsonArray results = new JsonArray();
        Solution sol = new Solution();
        
        for (JsonElement tc : testcases) {
            try {
                String tcStr = tc.getAsString();
                String[] lines = tcStr.split("\\n");
                
${paramParsing}
                
                Object res = sol.${metaData.name}(${argsList.join(', ')});
                results.add(gson.toJsonTree(res));
            } catch (Exception e) {
                JsonObject err = new JsonObject();
                err.addProperty("error", e.getMessage());
                results.add(err);
            }
        }
        System.out.println(gson.toJson(results));
    }
}
`;
  return wrapper;
}

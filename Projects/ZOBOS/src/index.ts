///#pragma once
///#include <compat.ts>
///#include <types.ts>
///#include <encoding.ts>
///#include <zlang.ts>
///#include <lex.ts>
///#include <graphviz.ts>


///<reference path="../../../lib/compat.ts"/> // Make VS Code happy 
///<reference path="../../../lib/types.ts"/> // Make VS Code happy
///<reference path="../../../lib/encoding.ts"/> // Make VS Code happy
///<reference path="../../../core/lex.ts"/> // Make VS Code happy
///<reference path="../../../core/zlang.ts"/> // Make VS Code happy
///<reference path="../../../lib/graphviz.ts"/> // Make VS Code happy

namespace ZOBOS {
    import SemanticErrors = ZLang.SemanticErrors;

    function output(...args: (string|number)[]) {
        const text = ['OUTPUT'];
        for(const arg of args) {
            switch(typeof arg) {
                case 'number': {
                    text.push(arg.toString());
                    break;
                }
                case 'string': {
                    text.push(`:${arg}:`);
                    break;
                }
            }
        }
        text.push(' ');
        console.log(text.join(' '));
    }
    
    function readTokenStream(path: string) {
        return system.readTextFileSync(path)
            .trim()
            .split('\n')
            .filter(x=>x.trim())
            .map(x=>x.trim().split(' '))
            .map(([name,value,line,col]) => new Token(name,alphaDecode(value),{line:+line,col:+col}))
        ;
    }
    
    function dumpAST(path: string, ast: ZLang.Program) {
        system.writeTextFileSync(path,Graphviz.serialize(ast as any));
    }

    const [tokenSrc,astOutput = 'program.ast',symbtableOutput = 'program.sym'] = system.args.slice(1);
    console.debug('Parsing...');
    
    // Read tokens
    const tokens = readTokenStream(tokenSrc);
    
    // Parse
    const ast = (function() {
        try {
            return ZLang.parseTokens(tokens);
        } catch(e) {
            output('SYNTAX',e?.pos?.line??0,e?.pos?.col??0,'SYNTAX');
            system.exit(1);
        }
    })();
    
    // Semantic error handeling
    let hasErrors = false;
    ZLang.raise = function(errno,message,pos) {
        switch(errno) {
            case SemanticErrors.REIDENT: {
                output('WARN', pos!.line, pos!.col, SemanticErrors[SemanticErrors.REIDENT]);
                return;
            }
            case SemanticErrors.EXPR: {
                hasErrors = true;
                console.error(message)
                output('ERROR',pos!.line,pos!.col,SemanticErrors[SemanticErrors.EXPR]);
                return;
            }
        }
    }
    
    ZLang.applySemantics(ast);
    
    // Emit Domain Statements
    ZLang.visit(ast, function(node) {
        if(node instanceof ZLang.Nodes.DomainNode) {
            output('DOMAIN',node.pos.line,node.pos.col,node.domain);
            return;
        }

        // Validate operator types
        // This is not the same as typechecking for assignment
        if(node instanceof ZLang.Nodes.BinaryOp) {
            if(
                (node.name === '%' && (node.lhs.domain !== 'int' || node.rhs.domain !== 'int'))
                || node.lhs.domain === 'bool' || node.lhs.domain === 'string'
                || node.rhs.domain === 'bool' || node.rhs.domain === 'string'
            ) {
                    ZLang.raise(SemanticErrors.EXPR, `Operator '${node.name}' is not valid for types ${node.lhs.domain} and ${node.rhs.domain}`,node.pos);                
                    return false;
            }
        }
        if(node instanceof ZLang.Nodes.UnaryOp) {
            if(
                (node.name === '~' && node.val.domain !== 'int')
                || (node.name === '!' && node.val.domain !== 'bool')
                || ((node.name === '+' || node.name === '-') && (node.val.domain === 'string' || node.val.domain === 'bool'))
            ) {
                ZLang.raise(SemanticErrors.EXPR, `Operator '${node.name}' is not valid for type ${node.val.domain}`,node.pos)
                return false;
            }
        }
        
        // Validate function identifiers are not used as variables
        if(
            node instanceof ZLang.Nodes.IdentifierNode
            // Ignore parameters in lone function prototype, they aren't declared
            && ZLang.getEnclosingScope(node)!.has(node.name,node.pos)
            && ZLang.getEnclosingScope(node)!.get(node.name,node.pos)!.type instanceof ZLang.ZFunctionType
        ) {
            const parent = node.parent;
            if(!(
                (parent instanceof ZLang.Nodes.FunctionCallNode && parent.ident === node)
                || (parent instanceof ZLang.Nodes.FunctionHeaderNode && parent.ident === node)
            )) {
                ZLang.raise(SemanticErrors.EXPR, `Function '${node.name}' cannot be treated like a variable!`, node.pos); // node.pos for ident location, parent.pos for what expects a var
                return false;
            }
        }

        if(node instanceof ZLang.Nodes.IdentifierNode) {
            // issue would have already been raised above, this is just to ensure domain is valid
            return ZLang.getEnclosingScope(node)!.has(node.name,node.pos);
        }
    },'post');
    
    // Emit Symtables
    ZLang.visit(ast,function(node) {
        if(symbtableOutput && node instanceof ZLang.Nodes.EmitStatement && node.data.type === 'symbtable') {
            system.writeTextFileSync(symbtableOutput,ZLang.getEnclosingScope(node)!.dir(node.pos).map(d => [d.n,d.type,d.name].join(',')).join('\n'));
        }
    });
    
    dumpAST(astOutput,ast);
    
    system.exit(hasErrors ? 1 : 0);
}
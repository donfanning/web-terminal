
var shell_commands = {
    echo: function(text) {
        this.echo(text);
    },
    help: function() {
        this.echo("Available commands:");
        this.echo("\tabout       information about this page");
        this.echo("\tcontact     display contact infomation");
        this.echo("\thelp        this help screen.");                        
        this.echo("");
        this.echo("some other basic Linux commands are available: cat cd id ls startx")
    },
    contact: function() {
        this.echo("Get in touch via:")
        this.echo("Email:   runner.mei@gmail.com");
    },
    about: function() {
        this.echo("This page built with tpt.", {raw:true});
    },
}

function shell(cmd, args, term) {
    var target_url = "ws://" + document.location.host +"/cmd?exec=" + cmd
    for(var idx in args) {
        target_url += ("&arg" + idx + "=" + args[idx])
    }

    try {
        var socket = new WebSocket(target_url);
        socket.onopen = function() {
            term.pause();
            term.set_prompt("");
        };
        socket.onerror = function(e) {
            term.error("connect server failed.") 
        };
        socket.onmessage = function(data) {
            term.echo(data.data);
        };
        socket.onclose  = function() {
            //term.destroy();
            term.resume()
            shell_prompt.apply(term, [term.set_prompt])
        };
    } catch(e) {
        term.error(e)
    }
}
function shell_prompt(p){
    p("tpt# ");
}

jQuery(document).ready(function($) {
    $('body').terminal(function(command, term) {
        command = $.terminal.parseCommand(command)
        var val = shell_commands[command.name];
        if(undefined == val || null == val) {
            shell(command.name, command.args, term)
            return
        }
        var type = $.type(val);
        if (type === 'function') {
            if (val.length !== command.args.length) {
                term.error("&#91;Arity&#93; wrong number of arguments. Function '" +
                           command.name + "' expect " + val.length + ' got ' +
                           command.args.length);
            } else {
                return val.apply(term, command.args);
            }
        } else {
            term.error(command.name + ": command not found");
        }
    }, {
        greetings: "[[b;#44D544;] _ _  ___  _ _  ___   _ _ _  ___  _ _  ___\n"+
                                  "| | || __>| \\ |/  _> | | | || __>| \\ |/  _>\n"+
                                  "|   || _> |   || <_/\\| | | || _> |   || <_/\\\n"+
                                  "|_|_||___>|_\\_|`____/|__/_/ |___>|_\\_|`____/\n]\n\n" +
            "[[b;#44D544;]help] if you dont know what to do next.\n",
        prompt: shell_prompt,
        onBlur: function() {
            // prevent loosing focus
            return false;
        },
        tabcompletion: true
    });
});

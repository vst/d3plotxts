module.exports = function(grunt) {

    grunt.initConfig({

        // Import package manifest
        pkg: grunt.file.readJSON("package.json"),

        // Banner definitions
        meta: {
            banner: "/*\n" +
                " *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n" +
                " *  <%= pkg.description %>\n" +
                " *  <%= pkg.homepage %>\n" +
                " *\n" +
                " *  Made by <%= pkg.author.name %>\n" +
                " *  Under <%= pkg.licenses[0].type %> License\n" +
                " */\n"
        },

        // Concat definitions
        concat: {
            dist: {
                src: ["src/jquery.d3plotxts.js"],
                dest: "dist/jquery.d3plotxts.js"
            },
            options: {
                banner: "<%= meta.banner %>"
            }
        },

        // Lint definitions
        jshint: {
            files: ["src/jquery.d3plotxts.js"],
            options: {
                jshintrc: ".jshintrc"
            }
        },

        // Minify definitions
        uglify: {
            my_target: {
                src: ["dist/jquery.d3plotxts.js"],
                dest: "dist/jquery.d3plotxts.min.js"
            },
            options: {
                banner: "<%= meta.banner %>"
            }
        },

        // CSS Minification.
        cssmin: {
            with_banner: {
                options: {
                    banner: "/* d3plotxts CSS */"
                },
                files: {
                    "dist/d3plotxts.min.css": ["src/**/*.css"]
                }
            }
        },

        // Copy original sacript:
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: "src/",
                        src: ["*.css", "*.js"],
                        dest: "dist/"
                    }
                ]
            }
        }
    });

    // Load NPM Tasks:
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-coffee");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-copy");

    // Register tasks:
    grunt.registerTask("default", ["jshint", "concat", "uglify", "cssmin", "copy"]);
    grunt.registerTask("travis", ["jshint"]);
};

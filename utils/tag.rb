#!/usr/bin/env ruby
require "git"
name = Time.now.to_i
repo = Git.open(".")
repo.add_tag(name)
repo.push("origin", name)
puts "Created tag: #{name}"
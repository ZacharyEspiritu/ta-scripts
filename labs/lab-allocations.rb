#!/bin/ruby

# Generates lab assignments from a list of student preferences.
#
# Documentation TODO.
#
# Written by: zespirit
# Last modified on 08/24/2019

require 'csv'

LAB_DEFINITIONS = {
  "Monday 3-5pm" => {min: 15, max: 24},
  "Monday 8-10pm" => {min: 15, max: 24},
  "Wednesday 4-6pm" => {min: 15, max: 24},
  "Wednesday 7-9pm" => {min: 15, max: 24},
  "Cannot attend any remaining lab sections" => {min: 0, max: 0}
}

UNASSIGNED_LAB_NAME = "__UNASSIGNED__"

STUDENT_IDENTIFIER = "CS Login"
CHOICE_PRIORITIES = {
  "First choice" => 1,
  "Second choice" => 2,
  "Third choice" => 3
}

##
## Custom Classes
##

class Array
  def safe_transpose
    result = []
    max_size = self.max { |a,b| a.size <=> b.size }.size
    max_size.times do |i|
      result[i] = Array.new(self.first.size)
      self.each_with_index { |r,j| result[i][j] = r[i] }
    end
    result
  end
end

class Student
  def initialize(student_id, choices)
    @identifier  = student_id
    @choices     = choices
    @is_assigned = false
  end

  def get_identifier()
    @identifier
  end

  def get_choices()
    @choices
  end

  def set_assigned(new_value)
    @is_assigned = new_value
  end

  def is_assigned?()
    @is_assigned
  end
end

##
## Script
##

def parse_csv(path_to_csv)
  identifier_col_num = -1
  priority_col_nums  = []
  students           = []
  CSV.open(path_to_csv) do |csv|
    csv.each_with_index do |row, index|
      if index == 0
        # Find STUDENT_IDENTIFIER column #:
        identifier_col_num = row.index(STUDENT_IDENTIFIER)
        # Sort CHOICE_PRIORITIES by value ascending, then find column #s:
        sorted_priorities = CHOICE_PRIORITIES.sort_by {|_key, value| value}
        priority_col_nums = sorted_priorities.map { |kv| row.index(kv[0]) }
      else
        # Parse each row into a Student instance:
        student_id      = row[identifier_col_num]
        student_choices = priority_col_nums.map { |prio_idx| row[prio_idx] }
        students << Student.new(student_id, student_choices)
      end
    end
  end
  students
end

def get_lab_assignment_hash()
  # Clone the lab definitions and add the base assignment hash to each lab:
  definitions_clone = LAB_DEFINITIONS.clone
  definitions_clone = Hash[definitions_clone.map do |k, v|
    [k, v.merge({is_full: v[:max].zero?, assignments: []})]
  end]
  # Add a space for unassigned students:
  definitions_clone[UNASSIGNED_LAB_NAME] = {min: 0, max: 0, assignments: []}
  definitions_clone
end

def bucket_fill(students, lab_hash)
  puts lab_hash
  # Calculate the overall minimum gap to fill:
  gap_to_fill = lab_hash.values.reduce(0) { |sum, stats| sum + stats[:min] }
  # Loop over students in the order given:
  students.each_with_index do |student, index|
    # Allocate the student to their most preferred bucket which is not already
    # full:
    student.get_choices().each do |lab_name|
      if lab_hash[lab_name][:is_full]
        next
      else
        # When a student is allocated to a bucket, add them to the bucket and
        # check if we're at max capacity:
        lab_hash[lab_name][:assignments] << student
        # Get some statistics:
        new_size = lab_hash[lab_name][:assignments].length
        min_size = lab_hash[lab_name][:min]
        max_size = lab_hash[lab_name][:max]
        students_left_to_assign = students.length - index - 1
        # Lower the gap_to_fill by 1 if it was filled by this assignment:
        if new_size <= min_size
          gap_to_fill -= 1
        end
        # If the lab reached capacity with this assignment, mark it full:
        if new_size >= max_size
          lab_hash[lab_name][:is_full] = true
        end
        # If the number of students left to assign is smaller than the gap to
        # be filled and the lab is at minimum capacity, mark it full:
        if (gap_to_fill >= students_left_to_assign) && (new_size >= min_size)
          lab_hash[lab_name][:is_full] = true
        end
        # Mark student as assigned:
        student.set_assigned(true)
        break
      end
    end
    # Check if student was assigned:
    unless student.is_assigned?
      lab_hash[UNASSIGNED_LAB_NAME][:assignments] << student
    end
  end
  lab_hash
end

def write_assignments_to_csv(lab_hash, output_path)
  lab_names   = LAB_DEFINITIONS.map { |lab_name, _| lab_name }
  lab_names  << UNASSIGNED_LAB_NAME
  assignments = []
  lab_names.each do |lab_name|
    lab_students = lab_hash[lab_name][:assignments].map { |student| student.get_identifier }
    assignments << lab_students.insert(0, lab_name)
  end

  csv_rows = assignments.safe_transpose

  CSV.open(output_path, "wb") do |csv|
    csv_rows.each do |row|
      csv << row
    end
  end
end

def main()
  if ARGV.length != 2
    STDERR.puts "Error: Incorrect number of arguments."
    STDERR.puts "Usage: ruby lab-allocations.rb <path-to-preference-csv>"
    STDERR.puts "       <path-for-output-csv>"
    exit
  end
  # Parse command-line arguments:
  path_to_csv = ARGV[0]
  output_path = ARGV[1]
  # Parse out CSV:
  students = parse_csv(path_to_csv)
  # Generate base lab assignment hash:
  assignments_base = get_lab_assignment_hash()

  # Bucket-fill the labs:
  filled_assignments = bucket_fill(students, assignments_base)
  # Output the results to a CSV:
  write_assignments_to_csv(filled_assignments, output_path)
end

main()

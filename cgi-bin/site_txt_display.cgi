#!/usr/bin/perl
use utf8;
use open ':utf8';
use Encode 'decode_utf8';
use warnings;
use diagnostics;
#
# Copyright Notice:
my $script_name = 'Site-Text-Display';
my $script_vers = '13.4.6';
my $script_date = 'Apr. 6, 2013';
my $script_year = '2013';

#  Copyright© - OpenSiteMobile
my $copyright_year = '2008-2013';

#  All rights reserved
#
# Description:
#
# Site-Text-Display is a simple perl script used to display text files (typically code) similar to
# the way FireFox does by default. It outputs files with a Content-Type of 'text/plain' in the
# HTTP header which instructs all browsers to display the selected file as text. The output is utf-8
# encoded, thus displaying MobileSiteOS™ scripts and pages correctly. Note: MobileSiteOS™ requires
# all scripts and pages use utf-8 encoding.
#
# License Agreement:
#
# This script is free software distributed under the GNU GPL version 2 or higher, 
# GNU LGPL version 2.1 or higher and Apache Software License 2.0 or higher. This means
# you may choose one of the three and use it as you like. In case you want to review
# these licenses, you may find them online in various formats at http://www.gnu.org and
# http://www.apache.org.
#
#   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
#   KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
#   WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
#   AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
#   COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
#   OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
#   SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
#
# Use of this script:
#
# Selling the code for this script without prior written consent is expressly
# forbidden. You must obtain written permission before redistributing this
# script for profit over the Internet or in any other medium. In any and all
# cases, copyright and header information must remain intact.
#
# Contact Information:
#
# Author: Dwight Vietzke Jr.
# Email:  dwight_vietzke@yahoo.com
#


# ==========================================================================
#     Beginning of script...
# ==========================================================================

use CGI::Carp qw(fatalsToBrowser set_message);
use CGI qw(:cgi);
use lib ('./lib');
use MSOS::Base;
use strict;

$CGI::POST_MAX=1024 * 25;	# max 25K posts
$CGI::DISABLE_UPLOADS = 1;	# no uploads
$CGI::HEADERS_ONCE = 1;		# one set of HTTP headers please

BEGIN { set_message(\&MSOS::Base::handle_errors); }

my %def = ();
my $q = new CGI;

my $display_file = '';
my $display_path = '';

for my $w ($q->param) {
    if ($w =~ m/^display_/) {
        $display_file = $q->param($w);
        $display_path = $w;
    }
}

%def = (

    'back_url'      => ($q->param('back_url') || $ENV{'HTTP_REFERER'} || 'http://' . ( $ENV{'SERVER_NAME'} || 'opensite.mobi' )),
    'home_url'      => 'http://' . ( $ENV{'SERVER_NAME'} || 'opensite.mobi' ),
    'script_url'    => $q->url,

	'txt_txt' => {

		'message3'	=>  'CGI Environment Variables',
		'message4'	=>  'not defined',
		'message5'	=>  'Perl Information',
		'message6'	=>  'Perl Exe',
		'message7'	=>  'Perl Version',
		'message8'	=>  'CGI.pm Version',
		'message9'	=>  'Carp.pm Version',
		'messagea'	=>  'This script requires input defining which text file to display!',
	},

    nav_txt => {

        'back'        => 'Back',
        'back_mes'    => 'Back to link page',
        'script'      => 'Script',
        'script_mes'  => 'Rerun Site-Text-Display',
        'home'        => 'Home',
        'home_mes'    => 'Go to our home page'
    }
);

# -- Page navigation....
$def{'back_url'} =~ s/&/&amp;/g;
$def{'cgi_url'} = "$def{'script_url'}?back_url=$def{'back_url'}";

$def{'navigate'}  = "<a class='btn btn-msos' href='$def{'back_url'}'    title='$def{'nav_txt'}{'back_mes'}'>		$def{'nav_txt'}{'back'}	</a> <span class='msos_spacer'>::</span>\n";
$def{'navigate'} .= "<a class='btn btn-msos' href='$def{'cgi_url'}'     title='$def{'nav_txt'}{'script_mes'}'>		$def{'nav_txt'}{'script'} </a> <span class='msos_spacer'>::</span>\n";
$def{'navigate'} .= "<a class='btn btn-msos' href='$def{'home_url'}'	title='$def{'nav_txt'}{'home_mes'}'>		$def{'nav_txt'}{'home'}	</a>\n";

# -- Add all our external config variables
foreach ( keys %$MSOS::Base::defined ) { $def{$_} = $MSOS::Base::defined->{$_}; }

# -- Add this script's details (default is MSOS::Base)
$def{'script_info'} = {
	'name'			=> $script_name,
	'revision_date'	=> $script_date,
	'version'		=> $script_vers,
	'year'			=> $copyright_year,
};

# -- Set Debug on/off
$def{'debug'} = $q->param('debug') || '';

# -- Debugging and tests
if ($def{'debug'}) {
	&MSOS::Base::run_debugging( $q, \%def );
}


#  Script Output Section
# ===========================

binmode(STDOUT, ":utf8");

if ($display_file && $display_path) {

    #  Decode display input string
    # ===========================
    $display_file =~ s/[^A-Za-z0-9_.]//g;   # only allow a-z, 0-9, underscores and periods (this is std. naming convention for all MobileSiteOS files).
    $display_path =~ s/[^A-Za-z0-9_]//g;    # only allow a-z, 0-9 and underscores.
    $display_path =~ s/^display_//;

    # Only allow javascirpt, css, html, json or text files to be viewed
    if ($display_file =~ m/\.js|\.css|\.html|\.json|\.txt$/) {

        $display_path =~ s/[_]/\//g;
        $display_path = $def{'site_base_dir'} . '/' . $display_path;

        if (-d $display_path) {
            # dir exists
            $display_file = $display_path . '/' . $display_file;

            if (-e $display_file && -f $display_file) {
                # file exists and is a plain file
                open (SCRIPT, "$display_file") or &MSOS::Base::handle_errors("Open - Failed! Can't display file:<br />$display_file", 'yes');

                print $q->header(

                    -type		=> 'text/plain; charset=utf-8',
                    -expires	=> 'now',
                    -last_modified	=> scalar(gmtime)
                );

                while ( <SCRIPT> ) { print; }
                close SCRIPT;

            } else {
                &MSOS::Base::handle_errors("File doesn't exist or isn't a plain text file:<br />$display_file", 'yes');
            }
        } else {
            &MSOS::Base::handle_errors("Direcrtory doesn't exist:<br />$display_path", 'yes');
        }

	} elsif ($display_path eq 'cgi' && $def{'redirect_cgi'}->{$display_file}) {

		# Only allow those we have previously set available
		$display_file = './' . $def{'redirect_cgi'}->{$display_file} . &MSOS::Base::check_ext();

        if (-e $display_file && -f $display_file) {
            # file exists and is a plain file
            open (SCRIPT, "$display_file") or &MSOS::Base::handle_errors("Open - Failed! Can't display script:<br />$display_file", 'yes');

            print $q->header(

                -type		=> 'text/plain; charset=utf-8',
                -expires	=> 'now',
                -last_modified	=> scalar(gmtime)
            );

            while ( <SCRIPT> ) { print; }
            close SCRIPT;

        } else {
            &MSOS::Base::handle_errors("Script doesn't exist or isn't a plain text file:<br />$display_file", 'yes');
        }

    } else {
        &MSOS::Base::handle_errors("Script " . $display_file . " is not available for text display!", 'yes');
    }

} else {

    #  Output default 'no text display' html5
    # ===========================

    print $q->header(

        -type		=> $def{'content_type'},
        -expires	=> 'now',
        -last_modified	=> scalar(gmtime)
    );

    print &MSOS::Base::start_print($q, \%def);

    &print_body($q, \%def);

    print &MSOS::Base::end_print($q, \%def);
}


#  End of Script
# =========================================================



#  SUBROUTINES
# =========================================================

sub print_body {
# -----------------------------

    my $r = shift;
    my $dref = shift;

    my $key = '';

    print "<article>\n\t<section>\n<h2>$dref->{'script_info'}->{'name'} v$dref->{'script_info'}->{'version'}</h2>\n";
	print "<div id='status'><span class='alert'>$dref->{'txt_txt'}->{'messagea'}</span></div>\n";

    print "<table class='table table-bordered table-striped table-wordbreak'>\n";
    print "<tr><th colspan='3'>$dref->{'txt_txt'}->{'message3'}</th></tr>\n";

    foreach $key ( sort keys %ENV ) {

        my $value = '';

        $value = $ENV{$key} || $dref->{'txt_txt'}->{'message4'};
        $value =~ s/;/; /g;
        $value =~ s/&/ &/g;
        $key =~ s/_/ /g;

        $value = CGI::escapeHTML($value);

        print "<tr><td>$key</td><td colspan='2'>$value</td></tr>\n";
    }
    print "</table>";

    print "<table class='table table-bordered table-striped table-wordbreak'>\n";
    print "<tr><th colspan='3'>$dref->{'txt_txt'}->{'message5'}</th></tr>\n";
    print "<tr><td>$dref->{'txt_txt'}->{'message6'}</td><td colspan='2'>$^X</td></tr>\n";
    print "<tr><td>$dref->{'txt_txt'}->{'message7'}</td><td colspan='2'>$]</td></tr>\n";
    print "<tr><td>$dref->{'txt_txt'}->{'message8'}</td><td colspan='2'>$CGI::VERSION</td></tr>\n";
    print "<tr><td>$dref->{'txt_txt'}->{'message9'}</td><td colspan='2'>$CGI::Carp::VERSION</td></tr>\n";
    print "</table>\n\t</section>\n</article>\n";
}

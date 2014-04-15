#!/usr/bin/perl

# Copyright Notice:
my $script_name = 'Site-Simple';
my $script_vers = '13.4.6';
my $script_date = 'Apr. 6, 2013';
my $script_year = '2013';

#  Copyright© - OpenSiteMobile
my $copyright_year = '2008-2013';

#  All rights reserved
#
# Description:
#
# Site-Simple is a simple perl script used to test Perl functionality on the web server
# as well as the availability of common Perl modules (ref. %modules) used by MobileSiteOS™.
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
my $q   = new CGI;

# Modules to load test:
# Add Perl module names just as they are in a simple 'use' statement
my %modules = (

    # Non-typically modules used by MobileSiteOS Basic (which may need to be installed)

    'algorithm_diff'        => [ 'Algorithm::Diff',         '' ],
    'html_template'         => [ 'HTML::Template',          '' ],
    'string_diff'           => [ 'String::Diff',            '' ],
    'html_tokeparser'       => [ 'HTML::TokeParser',        '' ],
    'json'                  => [ 'JSON',                    '' ],
    'image_imlib2'          => [ 'Image::Imlib2',           '' ],
    'image_imlib2_thumbnail'=> [ 'Image::Imlib2::Thumbnail','' ],
    'text_levenshtein'      => [ 'Text::Levenshtein',       '' ],
);


%def = (

    'back_url'      => ($q->param('back_url') || $ENV{'HTTP_REFERER'} || 'http://' . ( $ENV{'SERVER_NAME'} || 'opensite.mobi' )),
    'home_url'      => 'http://' . ( $ENV{'SERVER_NAME'} || 'opensite.mobi' ),
    'script_url'    => $q->url,

    'smpl_txt' => {

        'message5'    => 'Perl Information',
        'message6'    => 'Perl Exe',
        'message7'    => 'Perl Version',
        'message8'    => 'CGI.pm Version'
    },

    nav_txt => {

        'back'        => 'Back',
        'back_mes'    => 'Back to link page',
        'script'      => 'Script',
        'script_mes'  => 'Rerun Site-Simple',
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

# See if utf8 modules are avail. and use them...
my $test_utf8 = "require utf8;\nuse open ':utf8';";
eval $test_utf8;
if ( !$@ ) { binmode( STDOUT, ":utf8" ); }

print $q->header(

    -type          => $def{'content_type'},
    -expires       => 'now',
    -last_modified => scalar(gmtime)
);

print &MSOS::Base::start_print($q, \%def );
print &print_body( $q, \%def );
print &MSOS::Base::end_print($q, \%def );


#  End of Script
# =========================================================



#  SUBROUTINES
# =========================================================

sub print_body {

    # -----------------------------

    my $r    = shift;
    my $dref = shift;

    my $output = '';

    $output = "<article>\n\t<section>\n<h1>$dref->{'script_info'}->{'name'} v$dref->{'script_info'}->{'version'}</h1>\n";

    my $open_test = "use open ':utf8';";
    eval $open_test;
    if ($@) {
        $output .= "<h3>open - (Perl 5.8.1 or above?)</h3>\n";
        $output .= "<p>$@</p>";
    } else {
        $output .= "<h3>open -&gt; <span class='alert'>OK (Perl 5.8.1+)</span></h3>\n";
    }

    foreach ( keys %modules ) {
        my $test_for_module = 'require ' . $modules{$_}[0] . ';';
        eval $test_for_module;

        if ($@) {
            $output .= "<h3>$modules{$_}[0]</h3>\n";
            $output .= "<p>$@</p>";
            $@ = '';
        } else {
            $output .=
              "<h3>$modules{$_}[0] -&gt; <span class='alert'>OK</span></h3>\n";
        }
    }

    $output .= "<table class='table table-bordered table-striped table-wordbreak'>\n";
    $output .= "<tr><th colspan='2'>$dref->{'smpl_txt'}->{'message5'}</th></tr>\n";
    $output .= "<tr><td>$dref->{'smpl_txt'}->{'message6'}</td><td>$^X</td></tr>\n";
    $output .= "<tr><td>$dref->{'smpl_txt'}->{'message7'}</td><td>$]</td></tr>\n";
    $output .= "<tr><td>$dref->{'smpl_txt'}->{'message8'}</td><td>$CGI::VERSION</td></tr>\n";
    $output .= "</table>\n\t</section>\n</article>\n";

    return $output;
}
